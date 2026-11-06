import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: {
      DB_PATH: ':memory:',
      DB_SYNCHRONIZE: 'true',
      JWT_SECRET: 'e2e-test-secret-with-at-least-32-chars',
    },
  },
});
