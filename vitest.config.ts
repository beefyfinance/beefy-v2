import { defineConfig } from 'vitest/config';

// eslint-disable-next-line no-restricted-syntax -- required for Vite
export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    passWithNoTests: true,
  },
});
