import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

function optionalEnv(name: string): string {
  return process.env[name] ?? 'null';
}

const DB_USER = env('DB_USER');
const DB_PASS = env('DB_PASSWORD') === 'null' ? '' : env('DB_PASSWORD');
const DB_HOST = env('DB_HOST');
const DB_PORT = env('DB_PORT');
const DB_NAME = env('DB_NAME');

const DB_URL = `mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;


const SHADOW_USER = optionalEnv('SHADOW_USER');
const SHADOW_PASS = optionalEnv('SHADOW_PASSWORD') === 'null' ? '' : optionalEnv('SHADOW_PASSWORD');
const SHADOW_HOST = optionalEnv('SHADOW_HOST');
const SHADOW_PORT = optionalEnv('SHADOW_PORT');
const SHADOW_NAME = optionalEnv('SHADOW_NAME');
const SHADOW_URL = `mysql://${SHADOW_USER}:${SHADOW_PASS}@${SHADOW_HOST}:${SHADOW_PORT}/${SHADOW_NAME}`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { 
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: DB_URL,
    shadowDatabaseUrl: !SHADOW_USER || SHADOW_USER === 'null' ? undefined : SHADOW_URL
  }
});
