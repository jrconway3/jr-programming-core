import {
  EMAIL_PATTERN,
  URL_PATTERN,
  SPAM_TERMS,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_COMPANY_LENGTH,
  MAX_SUBJECT_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_WEBSITE_LENGTH,
  MIN_MESSAGE_LENGTH,
  SPAM_THRESHOLD,
  ONE_HOUR_MS,
  MINIMUM_SUBMISSION_AGE_MS,
  ContactPayload,
  NormalizedContactPayload,
  SpamScoreResult,
} from 'app/models/inquiries';

export function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

export function normalizeSingleLineText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength);
}

export function normalizeContactPayload(payload: ContactPayload): NormalizedContactPayload {
  const submittedAt = typeof payload.submittedAt === 'number'
    ? payload.submittedAt
    : typeof payload.submittedAt === 'string'
      ? (() => {
          const trimmedSubmittedAt = payload.submittedAt.trim();

          if (!trimmedSubmittedAt) {
            return null;
          }

          return Number(trimmedSubmittedAt);
        })()
      : null;

  return {
    name: normalizeSingleLineText(payload.name, MAX_NAME_LENGTH),
    email: normalizeSingleLineText(payload.email, MAX_EMAIL_LENGTH).toLowerCase(),
    company: normalizeSingleLineText(payload.company, MAX_COMPANY_LENGTH),
    subject: normalizeSingleLineText(payload.subject, MAX_SUBJECT_LENGTH),
    message: normalizeText(payload.message, MAX_MESSAGE_LENGTH),
    website: normalizeSingleLineText(payload.website, MAX_WEBSITE_LENGTH),
    submittedAt: Number.isFinite(submittedAt) ? Number(submittedAt) : null,
  };
}

export function validateContactPayload(payload: NormalizedContactPayload): string | null {
  if (!payload.name || !payload.email || !payload.subject || !payload.message) {
    return 'Please complete the required fields.';
  }

  if (!EMAIL_PATTERN.test(payload.email)) {
    return 'Please enter a valid email address.';
  }

  if (payload.message.length < MIN_MESSAGE_LENGTH) {
    return 'Please provide a few more details in your message.';
  }

  return null;
}

export function scoreSubmission(payload: {
  website: string;
  submittedAt: number | null;
  email: string;
  subject: string;
  message: string;
}, now: number = Date.now()): SpamScoreResult {
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
    const age = now - payload.submittedAt;

    if (age < 0) {
      score += 2;
      reasons.push('future-submit-timestamp');
    }

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

export function isSpamScore(score: number): boolean {
  return score >= SPAM_THRESHOLD;
}
