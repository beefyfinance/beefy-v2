import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { muiCompatSvgrPlugin, standardSvgrPlugin } from './tools/bundle/svgr.ts';

// eslint-disable-next-line no-restricted-syntax -- required for Vite
export default defineConfig({
  plugins: [
    // maps `@repo/styles/*` to `.cache/styles`, which the global setup generates when absent
    tsconfigPaths({
      loose: true,
      projects: ['./tsconfig.app.json'],
    }),
    standardSvgrPlugin(),
    muiCompatSvgrPlugin(),
  ],
  // .riv files are imported as urls; without this vite tries to parse them as JS
  assetsInclude: ['**/*.riv'],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    passWithNoTests: true,
    globalSetup: ['./vitest.global-setup.ts'],
  },
});
