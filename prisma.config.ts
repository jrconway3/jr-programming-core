import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

function optionalConfigEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  if (!value || value === 'null') {
    return undefined;
  }

  return value;
}

const DB_USER = env('DB_USER');
const DB_PASS = env('DB_PASSWORD') === 'null' ? '' : env('DB_PASSWORD');
const DB_HOST = env('DB_HOST');
const DB_PORT = env('DB_PORT');
const DB_NAME = env('DB_NAME');

const DB_URL = `mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const SHADOW_USER = optionalConfigEnv('SHADOW_USER');
const rawShadowPassword = process.env.SHADOW_PASSWORD?.trim();
const hasShadowPasswordConfig = rawShadowPassword !== undefined;
const SHADOW_PASS = rawShadowPassword === 'null' ? '' : rawShadowPassword ?? '';
const SHADOW_HOST = optionalConfigEnv('SHADOW_HOST');
const SHADOW_PORT = optionalConfigEnv('SHADOW_PORT');
const SHADOW_NAME = optionalConfigEnv('SHADOW_NAME');

const shadowConfigValues = {
  SHADOW_USER,
  SHADOW_PASSWORD: hasShadowPasswordConfig ? SHADOW_PASS : undefined,
  SHADOW_HOST,
  SHADOW_PORT,
  SHADOW_NAME,
};

const providedShadowConfigKeys = Object.entries(shadowConfigValues)
  .filter(([, value]) => value !== undefined)
  .map(([key]) => key);

let shadowDatabaseUrl: string | undefined;

if (providedShadowConfigKeys.length > 0) {
  const missingShadowConfigKeys = Object.entries(shadowConfigValues)
    .filter(([, value]) => value === undefined)
    .map(([key]) => key);

  if (missingShadowConfigKeys.length > 0) {
    throw new Error(`Incomplete shadow database configuration. Missing: ${missingShadowConfigKeys.join(', ')}`);
  }

  shadowDatabaseUrl = `mysql://${SHADOW_USER}:${SHADOW_PASS}@${SHADOW_HOST}:${SHADOW_PORT}/${SHADOW_NAME}`;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { 
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: DB_URL,
    shadowDatabaseUrl,
  },
});
