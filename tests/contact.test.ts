import { describe, expect, it } from 'vitest';
import {
  MIN_MESSAGE_LENGTH,
  MINIMUM_SUBMISSION_AGE_MS,
  MAX_WEBSITE_LENGTH,
  ONE_HOUR_MS,
  SPAM_THRESHOLD,
  isSpamScore,
  normalizeContactPayload,
  scoreSubmission,
  validateContactPayload,
} from '../lib/contact';

function createBasePayload() {
  return {
    name: 'Jane Client',
    email: 'jane@example.com',
    company: 'Acme Co',
    subject: 'Project inquiry',
    message: 'I need help building a new marketing site.',
    website: '',
    submittedAt: 10_000,
  };
}

describe('contact payload validation', () => {
  it('normalizes strings and lowercases email', () => {
    const payload = normalizeContactPayload({
      name: '  Jane Client  ',
      email: '  JANE@EXAMPLE.COM ',
      company: '  Acme Co ',
      subject: '  Project Inquiry ',
      message: '  Need a quote for a website build.  ',
      website: '  ',
      submittedAt: '12345',
    });

    expect(payload).toMatchObject({
      name: 'Jane Client',
      email: 'jane@example.com',
      company: 'Acme Co',
      subject: 'Project Inquiry',
      message: 'Need a quote for a website build.',
      website: '',
      submittedAt: 12345,
    });
  });

  it('strips line breaks from single-line fields but preserves message newlines', () => {
    const payload = normalizeContactPayload({
      name: 'Jane\r\nClient',
      email: 'Jane\r\n@Example.com',
      company: 'Acme\nCo',
      subject: 'Project\r\nInquiry',
      message: 'Line one\nLine two',
      website: 'bot\r\ntrap',
      submittedAt: '12345',
    });

    expect(payload).toMatchObject({
      name: 'Jane Client',
      email: 'jane @example.com',
      company: 'Acme Co',
      subject: 'Project Inquiry',
      message: 'Line one\nLine two',
      website: 'bot trap',
    });
  });

  it('truncates the honeypot field using its dedicated limit', () => {
    const payload = normalizeContactPayload({
      ...createBasePayload(),
      website: `  ${'x'.repeat(MAX_WEBSITE_LENGTH + 10)}  `,
    });

    expect(payload.website).toBe('x'.repeat(MAX_WEBSITE_LENGTH));
  });

  it('rejects missing required fields', () => {
    const payload = normalizeContactPayload({
      name: '',
      email: '',
      subject: '',
      message: '',
    });

    expect(validateContactPayload(payload)).toBe('Please complete the required fields.');
  });

  it('rejects invalid email addresses', () => {
    const payload = normalizeContactPayload({
      ...createBasePayload(),
      email: 'not-an-email',
    });

    expect(validateContactPayload(payload)).toBe('Please enter a valid email address.');
  });

  it('rejects messages shorter than the minimum length', () => {
    const payload = normalizeContactPayload({
      ...createBasePayload(),
      message: 'x'.repeat(MIN_MESSAGE_LENGTH - 1),
    });

    expect(validateContactPayload(payload)).toBe('Please provide a few more details in your message.');
  });

  it('accepts a valid inquiry payload', () => {
    const payload = normalizeContactPayload(createBasePayload());

    expect(validateContactPayload(payload)).toBeNull();
  });
});

describe('contact spam scoring', () => {
  it('does not flag a normal inquiry as spam', () => {
    const now = 20_000;
    const payload = createBasePayload();
    const result = scoreSubmission(payload, now);

    expect(result).toEqual({ score: 0, reasons: [] });
    expect(isSpamScore(result.score)).toBe(false);
  });

  it('flags honeypot submissions as spam', () => {
    const now = 20_000;
    const result = scoreSubmission({
      ...createBasePayload(),
      website: 'filled-by-bot',
    }, now);

    expect(result.score).toBeGreaterThanOrEqual(6);
    expect(result.reasons).toContain('honeypot-filled');
    expect(isSpamScore(result.score)).toBe(true);
  });

  it('flags very fast submissions', () => {
    const now = MINIMUM_SUBMISSION_AGE_MS - 1;
    const result = scoreSubmission({
      ...createBasePayload(),
      submittedAt: 0,
    }, now);

    expect(result.reasons).toContain('submitted-too-fast');
    expect(result.score).toBe(3);
  });

  it('flags stale form sessions', () => {
    const now = ONE_HOUR_MS * 24 + 5_000;
    const result = scoreSubmission({
      ...createBasePayload(),
      submittedAt: 0,
    }, now);

    expect(result.reasons).toContain('stale-form-session');
    expect(result.score).toBe(1);
  });

  it('flags messages with multiple links', () => {
    const now = 20_000;
    const result = scoreSubmission({
      ...createBasePayload(),
      message: 'Check https://one.example and https://two.example for the details.',
    }, now);

    expect(result.reasons).toContain('multiple-links');
    expect(result.score).toBe(3);
  });

  it('flags spam keywords', () => {
    const now = 20_000;
    const result = scoreSubmission({
      ...createBasePayload(),
      subject: 'SEO backlink guest post',
      message: 'Looking for seo and backlink opportunities with a guest post.',
    }, now);

    expect(result.reasons).toContain('spam-keywords:seo,backlink,guest post');
    expect(result.score).toBe(3);
  });

  it('caps keyword scoring at three points', () => {
    const now = 20_000;
    const result = scoreSubmission({
      ...createBasePayload(),
      subject: 'SEO backlink guest post casino loan crypto telegram whatsapp',
      message: 'seo backlink guest post casino loan crypto telegram whatsapp',
    }, now);

    expect(result.score).toBe(3);
  });

  it('flags repetitive message patterns', () => {
    const now = 20_000;
    const result = scoreSubmission({
      ...createBasePayload(),
      message: 'aaaaaaaa project inquiry',
    }, now);

    expect(result.reasons).toContain('repetitive-message-pattern');
    expect(result.score).toBe(2);
  });

  it('flags missing submit timestamps', () => {
    const now = 20_000;
    const result = scoreSubmission({
      ...createBasePayload(),
      submittedAt: null,
    }, now);

    expect(result.reasons).toContain('missing-submit-timestamp');
    expect(result.score).toBe(2);
  });

  it('crosses the spam threshold from combined signals', () => {
    const now = 2_000;
    const result = scoreSubmission({
      ...createBasePayload(),
      submittedAt: 0,
      subject: 'SEO backlink guest post',
      message: 'See https://one.example and https://two.example for seo help.',
    }, now);

    expect(result.score).toBeGreaterThanOrEqual(SPAM_THRESHOLD);
    expect(isSpamScore(result.score)).toBe(true);
  });
});