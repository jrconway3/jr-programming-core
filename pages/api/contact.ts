import { createHash } from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { prisma } from '../../prisma/adapter';

type ContactResponse = {
  message?: string;
  error?: string;
};

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
  submittedAt?: unknown;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /(https?:\/\/|www\.)/gi;
const SPAM_TERMS = ['seo', 'backlink', 'guest post', 'casino', 'loan', 'crypto', 'telegram', 'whatsapp'];
const TEN_MINUTES_MS = 10 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const MINIMUM_SUBMISSION_AGE_MS = 4000;
const DUPLICATE_SUBMISSION_WINDOW_MS = 2 * 60 * 1000;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 190;
const MAX_COMPANY_LENGTH = 120;
const MAX_SUBJECT_LENGTH = 140;
const MAX_MESSAGE_LENGTH = 4000;
const MIN_MESSAGE_LENGTH = 12;
const rateLimitStore = new Map<string, number[]>();

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  to: string;
  from: string;
};

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function getClientIp(req: NextApiRequest): string {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].trim();
  }

  return req.socket.remoteAddress ?? 'unknown';
}

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function isRateLimited(ipHash: string, now: number): boolean {
  const recentSubmissions = (rateLimitStore.get(ipHash) ?? []).filter((timestamp) => now - timestamp < ONE_HOUR_MS);
  rateLimitStore.set(ipHash, recentSubmissions);

  const submissionsInLastTenMinutes = recentSubmissions.filter((timestamp) => now - timestamp < TEN_MINUTES_MS).length;

  if (recentSubmissions.length >= 5 || submissionsInLastTenMinutes >= 3) {
    return true;
  }

  recentSubmissions.push(now);
  rateLimitStore.set(ipHash, recentSubmissions);
  return false;
}

function scoreSubmission(payload: {
  website: string;
  submittedAt: number | null;
  email: string;
  subject: string;
  message: string;
}): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const combinedText = `${payload.email} ${payload.subject} ${payload.message}`.toLowerCase();
  const matchedTerms = SPAM_TERMS.filter((term) => combinedText.includes(term));
  const linkCount = (combinedText.match(URL_PATTERN) ?? []).length;

  if (payload.website.length > 0) {
    score += 6;
    reasons.push('honeypot-filled');
  }

  if (payload.submittedAt === null) {
    score += 2;
    reasons.push('missing-submit-timestamp');
  } else {
    const age = Date.now() - payload.submittedAt;

    if (age >= 0 && age < MINIMUM_SUBMISSION_AGE_MS) {
      score += 3;
      reasons.push('submitted-too-fast');
    }

    if (age > ONE_HOUR_MS * 24) {
      score += 1;
      reasons.push('stale-form-session');
    }
  }

  if (linkCount >= 2) {
    score += 3;
    reasons.push('multiple-links');
  }

  if (matchedTerms.length > 0) {
    score += Math.min(3, matchedTerms.length);
    reasons.push(`spam-keywords:${matchedTerms.join(',')}`);
  }

  if (/([a-z0-9])\1{7,}/i.test(payload.message)) {
    score += 2;
    reasons.push('repetitive-message-pattern');
  }

  return { score, reasons };
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
  const port = Number(process.env.SMTP_PORT ?? '587');
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const to = process.env.CONTACT_EMAIL_TO?.trim();
  const from = process.env.CONTACT_EMAIL_FROM?.trim();

  if (!host || !Number.isFinite(port) || !to || !from) {
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
    const body = (req.body ?? {}) as ContactPayload;
    const name = normalizeText(body.name, MAX_NAME_LENGTH);
    const email = normalizeText(body.email, MAX_EMAIL_LENGTH).toLowerCase();
    const company = normalizeText(body.company, MAX_COMPANY_LENGTH);
    const subject = normalizeText(body.subject, MAX_SUBJECT_LENGTH);
    const message = normalizeText(body.message, MAX_MESSAGE_LENGTH);
    const website = normalizeText(body.website, MAX_COMPANY_LENGTH);
    const submittedAt = typeof body.submittedAt === 'number'
      ? body.submittedAt
      : typeof body.submittedAt === 'string'
        ? Number(body.submittedAt)
        : null;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Please complete the required fields.' });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (message.length < MIN_MESSAGE_LENGTH) {
      return res.status(400).json({ error: 'Please provide a few more details in your message.' });
    }

    const now = Date.now();
    const ipHash = hashValue(getClientIp(req));

    if (isRateLimited(ipHash, now)) {
      return res.status(429).json({ error: 'Too many submissions from this network. Please try again later.' });
    }

    const { score, reasons } = scoreSubmission({
      website,
      submittedAt: Number.isFinite(submittedAt) ? Number(submittedAt) : null,
      email,
      subject,
      message,
    });

    const shouldSendToOwner = score < 4;
    const status = shouldSendToOwner ? 'pending' : 'spam';

    const recentDuplicate = await prisma.inquiry.findFirst({
      where: {
        name,
        email,
        company: company || null,
        subject,
        message,
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
        name,
        email,
        company: company || null,
        subject,
        message,
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
            name,
            email,
            company,
            subject,
            message,
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