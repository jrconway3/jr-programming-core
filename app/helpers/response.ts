import type { NextApiResponse } from 'next';

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: {
    message: string;
    code?: string;
  };
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;

export function sendApiSuccess<T>(res: NextApiResponse<ApiEnvelope<T>>, status: number, data: T) {
  return res.status(status).json({
    ok: true,
    data,
  });
}

export function sendApiError(
  res: NextApiResponse<ApiError>,
  status: number,
  message: string,
  code?: string,
) {
  return res.status(status).json({
    ok: false,
    error: {
      message,
      ...(code ? { code } : {}),
    },
  });
}

export function extractApiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== 'object' || payload === null) {
    return fallback;
  }

  const value = payload as {
    error?: {
      message?: unknown;
    };
  };

  return typeof value.error?.message === 'string' && value.error.message.trim()
    ? value.error.message
    : fallback;
}
