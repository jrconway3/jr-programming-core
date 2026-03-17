import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from 'process';

const adapter = new PrismaMariaDb(
  {
    host: env.DB_HOST,
    port: env.DB_PORT ? parseInt(env.DB_PORT) : 3306,
    user: env.DB_USER,
    password: env.DB_PASSWORD === 'null' ? '' : env.DB_PASSWORD,
    database: env.DB_NAME,
    connectionLimit: 5
  }
);

export const prisma = new PrismaClient({ adapter });