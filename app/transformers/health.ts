export type HealthRecord = {
  status: 'ok' | 'error';
  database: 'ok' | 'misconfigured' | 'unavailable';
  timestamp: string;
  message?: string;
  missingEnv?: string[];
};

export function transformHealthOk(): HealthRecord {
  return {
    status: 'ok',
    database: 'ok',
    timestamp: new Date().toISOString(),
  };
}

export function transformHealthMisconfigured(missingEnv: string[]): HealthRecord {
  return {
    status: 'error',
    database: 'misconfigured',
    missingEnv,
    timestamp: new Date().toISOString(),
  };
}

export function transformHealthUnavailable(message: string): HealthRecord {
  return {
    status: 'error',
    database: 'unavailable',
    message,
    timestamp: new Date().toISOString(),
  };
}
