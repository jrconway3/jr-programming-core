import { createHash, createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type JsonValue = Record<string, unknown>;

type MockResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: JsonValue | null;
  status: (code: number) => MockResponse;
  json: (payload: JsonValue) => MockResponse;
  setHeader: (name: string, value: string) => void;
};

const sendMailMock = vi.fn();
const createTransportMock = vi.fn(() => ({ sendMail: sendMailMock }));
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

const prismaMock = {
  inquiry: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('nodemailer', () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

vi.mock('../prisma/adapter', () => ({
  prisma: prismaMock,
}));

function createRequest(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    method: 'POST',
    body: {
      name: 'Jane Client',
      email: 'jane@example.com',
      company: 'Acme Co',
      subject: 'Project inquiry',
      message: 'I need help building a new marketing site.',
      website: '',
      submittedAt: 1,
    },
    headers: {
      'user-agent': 'vitest',
      'x-forwarded-for': '203.0.113.25',
    },
    socket: {
      remoteAddress: '127.0.0.1',
    },
    ...overrides,
  };
}

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: JsonValue) {
      this.body = payload;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
  };
}

async function loadHandler() {
  vi.resetModules();
  const module = await import('../pages/api/contact');
  return module.default;
}

async function loadContactApiModule() {
  vi.resetModules();
  return import('../pages/api/contact');
}

describe('contact API handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.inquiry.findFirst.mockReset();
    prismaMock.inquiry.create.mockReset();
    prismaMock.inquiry.update.mockReset();
    sendMailMock.mockReset();
    createTransportMock.mockReset();
    createTransportMock.mockImplementation(() => ({ sendMail: sendMailMock }));
    consoleErrorSpy.mockClear();
    prismaMock.inquiry.findFirst.mockResolvedValue(null);
    prismaMock.inquiry.create.mockResolvedValue({ id: 123 });
    prismaMock.inquiry.update.mockResolvedValue({ id: 123 });
    sendMailMock.mockResolvedValue({ messageId: 'message-id-1' });

    process.env.CONTACT_EMAIL_TO = 'owner@example.com';
    process.env.CONTACT_EMAIL_FROM = 'website@example.com';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'smtp-user';
    process.env.SMTP_PASSWORD = 'smtp-password';
    process.env.CONTACT_IP_HASH_SECRET = 'contact-ip-secret';

    vi.useRealTimers();
  });

  it('rejects non-POST methods', async () => {
    const handler = await loadHandler();
    const req = createRequest({ method: 'GET' });
    const res = createResponse();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
    expect(res.body).toEqual({ error: 'Method not allowed' });
  });

  it('rejects invalid payloads before touching persistence', async () => {
    const handler = await loadHandler();
    const req = createRequest({
      body: {
        name: 'Jane Client',
        email: 'invalid-email',
        subject: 'Project inquiry',
        message: 'Need help soon.',
      },
    });
    const res = createResponse();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Please enter a valid email address.' });
    expect(prismaMock.inquiry.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.inquiry.create).not.toHaveBeenCalled();
  });

  it('stores spam inquiries without sending email', async () => {
    const handler = await loadHandler();
    const req = createRequest({
      body: {
        name: 'Spam Test',
        email: 'spam-test@example.com',
        company: 'Spam Co',
        subject: 'SEO backlink guest post',
        message: 'I can help with seo and backlink placement. See https://spam.example and https://links.example for details.',
        website: 'filled-by-bot',
        submittedAt: Date.now(),
      },
    });
    const res = createResponse();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(prismaMock.inquiry.create).toHaveBeenCalledOnce();
    expect(prismaMock.inquiry.create.mock.calls[0]?.[0]).toMatchObject({
      data: {
        ip_hash: createHmac('sha256', 'contact-ip-secret').update('203.0.113.25').digest('hex'),
        status: 'spam',
        sent_at: null,
      },
    });
    expect(sendMailMock).not.toHaveBeenCalled();
    expect(prismaMock.inquiry.update).not.toHaveBeenCalled();
  });

  it('sends legitimate inquiries and marks them as sent', async () => {
    const handler = await loadHandler();
    const now = Date.now();
    const req = createRequest({
      body: {
        name: 'Jane Client',
        email: 'jane@example.com',
        company: 'Acme Co',
        subject: 'Project inquiry',
        message: 'I need help building a new marketing site and would like to discuss a timeline.',
        website: '',
        submittedAt: now - 10_000,
      },
    });
    const res = createResponse();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(createTransportMock).toHaveBeenCalledOnce();
    expect(sendMailMock).toHaveBeenCalledOnce();
    expect(prismaMock.inquiry.create.mock.calls[0]?.[0]).toMatchObject({
      data: {
        ip_hash: createHmac('sha256', 'contact-ip-secret').update('203.0.113.25').digest('hex'),
        status: 'pending',
      },
    });
    expect(prismaMock.inquiry.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: {
        status: 'sent',
        sent_at: expect.any(Date),
      },
    });
  });

  it('marks inquiries as delivery_failed when SMTP is not configured', async () => {
    delete process.env.SMTP_HOST;

    const handler = await loadHandler();
    const req = createRequest({
      body: {
        name: 'Jane Client',
        email: 'jane@example.com',
        company: 'Acme Co',
        subject: 'Project inquiry',
        message: 'I need help building a new marketing site and would like to discuss a timeline.',
        website: '',
        submittedAt: Date.now() - 10_000,
      },
    });
    const res = createResponse();

    await handler(req as never, res as never);

    expect(sendMailMock).not.toHaveBeenCalled();
    expect(prismaMock.inquiry.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: { status: 'delivery_failed' },
    });
  });

  it('marks inquiries as delivery_failed when sending throws', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('smtp failed'));

    const handler = await loadHandler();
    const req = createRequest({
      body: {
        name: 'Jane Client',
        email: 'jane@example.com',
        company: 'Acme Co',
        subject: 'Project inquiry',
        message: 'I need help building a new marketing site and would like to discuss a timeline.',
        website: '',
        submittedAt: Date.now() - 10_000,
      },
    });
    const res = createResponse();

    await handler(req as never, res as never);

    expect(sendMailMock).toHaveBeenCalledOnce();
    expect(prismaMock.inquiry.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: { status: 'delivery_failed' },
    });
  });

  it('returns early for duplicate inquiries', async () => {
    prismaMock.inquiry.findFirst.mockResolvedValueOnce({ id: 77 });

    const handler = await loadHandler();
    const req = createRequest({
      body: {
        name: 'Jane Client',
        email: 'jane@example.com',
        company: 'Acme Co',
        subject: 'Project inquiry',
        message: 'I need help building a new marketing site and would like to discuss a timeline.',
        website: '',
        submittedAt: Date.now() - 10_000,
      },
    });
    const res = createResponse();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Your inquiry has already been received.' });
    expect(prismaMock.inquiry.create).not.toHaveBeenCalled();
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('rate limits repeated submissions from the same network', async () => {
    const handler = await loadHandler();
    const body = {
      name: 'Jane Client',
      email: 'jane@example.com',
      company: 'Acme Co',
      subject: 'Project inquiry',
      message: 'I need help building a new marketing site and would like to discuss a timeline.',
      website: '',
      submittedAt: Date.now() - 10_000,
    };

    for (let index = 0; index < 3; index += 1) {
      prismaMock.inquiry.findFirst.mockResolvedValueOnce({ id: index + 1 });
      const req = createRequest({ body });
      const res = createResponse();
      await handler(req as never, res as never);
      expect(res.statusCode).toBe(200);
    }

    prismaMock.inquiry.findFirst.mockResolvedValueOnce(null);
    const blockedReq = createRequest({ body });
    const blockedRes = createResponse();

    await handler(blockedReq as never, blockedRes as never);

    expect(blockedRes.statusCode).toBe(429);
    expect(blockedRes.body).toEqual({ error: 'Too many submissions from this network. Please try again later.' });
    expect(prismaMock.inquiry.create).not.toHaveBeenCalled();
  });

  it('removes stale rate-limit buckets after submissions expire', async () => {
    vi.useFakeTimers();
    const now = new Date('2026-04-06T12:00:00.000Z');
    vi.setSystemTime(now);

    const module = await loadContactApiModule();
    const handler = module.default;
    const trackedIp = '203.0.113.99';
    const body = {
      name: 'Jane Client',
      email: 'jane@example.com',
      company: 'Acme Co',
      subject: 'Project inquiry',
      message: 'I need help building a new marketing site and would like to discuss a timeline.',
      website: '',
      submittedAt: now.getTime() - 10_000,
    };

    prismaMock.inquiry.findFirst.mockResolvedValueOnce({ id: 1 });
    const firstReq = createRequest({
      body,
      headers: {
        'user-agent': 'vitest',
        'x-forwarded-for': trackedIp,
      },
    });
    const firstRes = createResponse();

    await handler(firstReq as never, firstRes as never);

    expect(module.contactApiTestState.rateLimitStore.size).toBe(1);

    vi.setSystemTime(new Date(now.getTime() + 2 * 60 * 60 * 1000));

    prismaMock.inquiry.findFirst.mockResolvedValueOnce({ id: 2 });
    const secondReq = createRequest({
      body: {
        ...body,
        submittedAt: Date.now() - 10_000,
      },
      headers: {
        'user-agent': 'vitest',
        'x-forwarded-for': trackedIp,
      },
    });
    const secondRes = createResponse();

    await handler(secondReq as never, secondRes as never);

    const ipHash = createHmac('sha256', 'contact-ip-secret').update(trackedIp).digest('hex');
    const timestamps = module.contactApiTestState.rateLimitStore.get(ipHash);
    expect(timestamps).toEqual([Date.now()]);
    expect(module.contactApiTestState.rateLimitStore.size).toBe(1);
  });

  it('does not persist ip_hash when the HMAC secret is missing', async () => {
    delete process.env.CONTACT_IP_HASH_SECRET;

    const module = await loadContactApiModule();
    const handler = module.default;
    const rawIp = '198.51.100.41';
    const req = createRequest({
      body: {
        name: 'Jane Client',
        email: 'jane@example.com',
        company: 'Acme Co',
        subject: 'Project inquiry',
        message: 'I need help building a new marketing site and would like to discuss a timeline.',
        website: '',
        submittedAt: Date.now() - 10_000,
      },
      headers: {
        'user-agent': 'vitest',
        'x-forwarded-for': rawIp,
      },
    });
    const res = createResponse();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(prismaMock.inquiry.create).toHaveBeenCalledOnce();
    expect(prismaMock.inquiry.create.mock.calls[0]?.[0]).toMatchObject({
      data: {
        ip_hash: null,
      },
    });
    const fallbackKey = createHash('sha256').update(rawIp).digest('hex');
    expect(module.contactApiTestState.rateLimitStore.get(rawIp)).toBeUndefined();
    expect(module.contactApiTestState.rateLimitStore.get(fallbackKey)).toEqual([expect.any(Number)]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CONTACT_IP_HASH_SECRET is not configured; inquiry IP hashes will not be persisted.',
    );
  });
});