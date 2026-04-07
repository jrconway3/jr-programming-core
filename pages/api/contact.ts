import { createHash, createHmac } from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import {
  DUPLICATE_SUBMISSION_WINDOW_MS,
  ONE_HOUR_MS,
  TEN_MINUTES_MS,
  isSpamScore,
  normalizeContactPayload,
  scoreSubmission,
  validateContactPayload,
} from '../../lib/contact';
import { prisma } from '../../prisma/adapter';

type ContactResponse = {
  message?: string;
  error?: string;
};

const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_PRUNE_INTERVAL_MS = 5 * 60 * 1000;
const MAX_RATE_LIMIT_KEYS = 1024;
let lastRateLimitPruneAt = 0;

export const contactApiTestState = {
  rateLimitStore,
  MAX_RATE_LIMIT_KEYS,
};

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  to: string;
  from: string;
};

let hasWarnedAboutMissingIpHashSecret = false;

function isTrustedProxyRemoteAddress(remoteAddress: string | undefined): boolean {
  if (!remoteAddress) {
    return false;
  }

  const normalizedAddress = remoteAddress.toLowerCase();
  const ipv4Address = normalizedAddress.startsWith('::ffff:') ? normalizedAddress.slice(7) : normalizedAddress;

  if (ipv4Address === '127.0.0.1' || ipv4Address.startsWith('127.')) {
    return true;
  }

  if (ipv4Address.startsWith('10.') || ipv4Address.startsWith('192.168.')) {
    return true;
  }

  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ipv4Address)) {
    return true;
  }

  return normalizedAddress === '::1'
    || normalizedAddress.startsWith('fc')
    || normalizedAddress.startsWith('fd')
    || normalizedAddress.startsWith('fe80:');
}

function getClientIp(req: NextApiRequest): string {
  const remoteAddress = req.socket.remoteAddress;

  if (!isTrustedProxyRemoteAddress(remoteAddress)) {
    return remoteAddress ?? 'unknown';
  }

  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].trim();
  }

  return remoteAddress ?? 'unknown';
}

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function hashIpAddress(value: string): string | null {
  const secret = process.env.CONTACT_IP_HASH_SECRET?.trim();

  if (!secret) {
    if (!hasWarnedAboutMissingIpHashSecret) {
      console.error('CONTACT_IP_HASH_SECRET is not configured; inquiry IP hashes will not be persisted.');
      hasWarnedAboutMissingIpHashSecret = true;
    }

    return null;
  }

  return createHmac('sha256', secret).update(value).digest('hex');
}

function pruneRateLimitStore(now: number) {
  for (const [key, timestamps] of rateLimitStore.entries()) {
    const recentSubmissions = timestamps.filter((timestamp) => now - timestamp < ONE_HOUR_MS);

    if (recentSubmissions.length === 0) {
      rateLimitStore.delete(key);
      continue;
    }

    rateLimitStore.set(key, recentSubmissions);
  }

  if (rateLimitStore.size <= MAX_RATE_LIMIT_KEYS) {
    return;
  }

  const entriesByRecency = Array.from(rateLimitStore.entries())
    .map(([key, timestamps]) => ({
      key,
      latestTimestamp: timestamps[timestamps.length - 1] ?? 0,
    }))
    .sort((left, right) => left.latestTimestamp - right.latestTimestamp);

  const excessEntryCount = rateLimitStore.size - MAX_RATE_LIMIT_KEYS;

  for (let index = 0; index < excessEntryCount; index += 1) {
    const entry = entriesByRecency[index];

    if (entry) {
      rateLimitStore.delete(entry.key);
    }
  }
}

function isRateLimited(ipHash: string, now: number): boolean {
  if (lastRateLimitPruneAt === 0 || now - lastRateLimitPruneAt >= RATE_LIMIT_PRUNE_INTERVAL_MS || rateLimitStore.size >= MAX_RATE_LIMIT_KEYS) {
    pruneRateLimitStore(now);
    lastRateLimitPruneAt = now;
  }

  const recentSubmissions = (rateLimitStore.get(ipHash) ?? []).filter((timestamp) => now - timestamp < ONE_HOUR_MS);

  if (recentSubmissions.length === 0) {
    rateLimitStore.delete(ipHash);
  } else {
    rateLimitStore.set(ipHash, recentSubmissions);
  }

  const submissionsInLastTenMinutes = recentSubmissions.filter((timestamp) => now - timestamp < TEN_MINUTES_MS).length;

  if (recentSubmissions.length >= 5 || submissionsInLastTenMinutes >= 3) {
    return true;
  }

  recentSubmissions.push(now);
  rateLimitStore.set(ipHash, recentSubmissions);

  if (rateLimitStore.size > MAX_RATE_LIMIT_KEYS) {
    pruneRateLimitStore(now);
    lastRateLimitPruneAt = now;
  }

  return false;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const portValue = process.env.SMTP_PORT?.trim();
  const port = portValue === undefined ? 587 : Number(portValue);
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const to = process.env.CONTACT_EMAIL_TO?.trim();
  const from = process.env.CONTACT_EMAIL_FROM?.trim();

  if (!host || portValue === '' || !Number.isInteger(port) || port < 1 || port > 65535 || !to || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: secureEnv ? secureEnv === 'true' : port === 465,
    user,
    password,
    to,
    from,
  };
}

async function sendContactNotification(config: MailConfig, payload: {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user && config.password
      ? {
          user: config.user,
          pass: config.password,
        }
      : undefined,
  });

  const companyLine = payload.company ? `Company: ${payload.company}\n` : '';
  const htmlCompanyLine = payload.company
    ? `<p><strong>Company:</strong> ${escapeHtml(payload.company)}</p>`
    : '';

  await transporter.sendMail({
    to: config.to,
    from: config.from,
    replyTo: payload.email,
    subject: `JRProgramming inquiry: ${payload.subject}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      companyLine.trimEnd(),
      `Subject: ${payload.subject}`,
      '',
      payload.message,
    ].filter(Boolean).join('\n'),
    html: [
      '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">',
      '<h2>New JRProgramming inquiry</h2>',
      `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>`,
      `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>`,
      htmlCompanyLine,
      `<p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>`,
      `<p><strong>Message:</strong></p>`,
      `<p>${escapeHtml(payload.message).replace(/\n/g, '<br />')}</p>`,
      '</div>',
    ].filter(Boolean).join(''),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ContactResponse>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = normalizeContactPayload(req.body ?? {});
    const validationError = validateContactPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const now = Date.now();
    const clientIp = getClientIp(req);
    const ipHash = hashIpAddress(clientIp);
    const rateLimitKey = ipHash ?? hashValue(clientIp);

    if (isRateLimited(rateLimitKey, now)) {
      return res.status(429).json({ error: 'Too many submissions from this network. Please try again later.' });
    }

    const { score, reasons } = scoreSubmission({
      website: payload.website,
      submittedAt: payload.submittedAt,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    }, now);

    const shouldSendToOwner = !isSpamScore(score);
    const status = shouldSendToOwner ? 'pending' : 'spam';

    const recentDuplicate = await prisma.inquiry.findFirst({
      where: {
        name: payload.name,
        email: payload.email,
        company: payload.company || null,
        subject: payload.subject,
        message: payload.message,
        created_at: {
          gte: new Date(now - DUPLICATE_SUBMISSION_WINDOW_MS),
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (recentDuplicate) {
      return res.status(200).json({
        message: 'Your inquiry has already been received.',
      });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: payload.name,
        email: payload.email,
        company: payload.company || null,
        subject: payload.subject,
        message: payload.message,
        status,
        spam_score: score,
        spam_reason: reasons.length > 0 ? reasons.join(';') : null,
        ip_hash: ipHash,
        user_agent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null,
        sent_at: null,
      },
    });

    if (shouldSendToOwner) {
      const mailConfig = getMailConfig();

      if (!mailConfig) {
        console.error('Contact email delivery is not configured.');
        await prisma.inquiry.update({
          where: { id: inquiry.id },
          data: { status: 'delivery_failed' },
        });
      } else {
        try {
          await sendContactNotification(mailConfig, {
            name: payload.name,
            email: payload.email,
            company: payload.company,
            subject: payload.subject,
            message: payload.message,
          });

          await prisma.inquiry.update({
            where: { id: inquiry.id },
            data: {
              status: 'sent',
              sent_at: new Date(),
            },
          });
        } catch (mailError) {
          console.error('Contact inquiry email delivery failed', mailError);
          await prisma.inquiry.update({
            where: { id: inquiry.id },
            data: { status: 'delivery_failed' },
          });
        }
      }
    }

    return res.status(200).json({
      message: 'Your inquiry has been received. I will review it and follow up if a response is needed.',
    });
  } catch (error) {
    console.error('POST /api/contact failed', error);
    return res.status(500).json({ error: 'Unable to submit your inquiry right now.' });
  }
}