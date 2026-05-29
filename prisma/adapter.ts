import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from 'process';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaMariaDb({
    host: env.DB_HOST,
    port: env.DB_PORT ? parseInt(env.DB_PORT) : 3306,
    user: env.DB_USER,
    password: env.DB_PASSWORD === 'null' ? '' : env.DB_PASSWORD,
    database: env.DB_NAME,
    connectionLimit: 20,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}