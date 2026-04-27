import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      app: path.resolve(__dirname, 'app'),
      components: path.resolve(__dirname, 'components'),
      prisma: path.resolve(__dirname, 'prisma'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});