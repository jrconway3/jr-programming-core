export type ContactPayload = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
  submittedAt?: unknown;
};

export type NormalizedContactPayload = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  website: string;
  submittedAt: number | null;
};

export type SpamScoreResult = {
  score: number;
  reasons: string[];
};

export type InquiryStatusRecord = {
  id: number;
  status: string;
  updated_at: string;
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_PATTERN = /(https?:\/\/|www\.)/gi;
export const SPAM_TERMS = ['seo', 'backlink', 'guest post', 'casino', 'loan', 'crypto', 'telegram', 'whatsapp'];
export const TEN_MINUTES_MS = 10 * 60 * 1000;
export const ONE_HOUR_MS = 60 * 60 * 1000;
export const MINIMUM_SUBMISSION_AGE_MS = 4000;
export const DUPLICATE_SUBMISSION_WINDOW_MS = 2 * 60 * 1000;
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 190;
export const MAX_COMPANY_LENGTH = 120;
export const MAX_SUBJECT_LENGTH = 140;
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_WEBSITE_LENGTH = 120;
export const MIN_MESSAGE_LENGTH = 12;
export const SPAM_THRESHOLD = 4;