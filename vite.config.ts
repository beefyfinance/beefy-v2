import { defineConfig, type Plugin } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import RollupNodePolyFillPlugin from 'rollup-plugin-polyfill-node';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import versionPlugin from './tools/bundle/version-plugin.ts';
import cspPlugin from './tools/bundle/csp-plugin.ts';
import headersPlugin from './tools/bundle/headers-plugin.ts';
import tsconfigPaths from 'vite-tsconfig-paths';
import { muiCompatSvgrPlugin, standardSvgrPlugin } from './tools/bundle/svgr.ts';

const optionalPlugins: Plugin[] = [];

if (process.env.ANALYZE_BUNDLE) {
  optionalPlugins.push(
    visualizer({
      template: 'treemap', // or treemap/sunburst
      open: true,
      gzipSize: true,
      brotliSize: false,
      filename: 'analyze-bundle.html',
      projectRoot: import.meta.dirname.replaceAll('\\', '/'),
    })
  );
}

// https://vitejs.dev/config/
// eslint-disable-next-line no-restricted-syntax -- required for Vite
export default defineConfig({
  assetsInclude: ['**/*.riv'],
  server: {
    open: true,
  },
  plugins: [
    tsconfigPaths({
      loose: true,
      projects: ['./tsconfig.app.json', './tsconfig.scripts.json'],
    }),
    react(),
    standardSvgrPlugin(),
    muiCompatSvgrPlugin(),
    headersPlugin({
      headers: {
        '/*': { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' },
      },
    }),
    versionPlugin(),
    cspPlugin({
      reportOnly: false,
      reportTo: process.env.CSP_REPORT_TO,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'wasm-unsafe-eval'", 'https://static.cloudflareinsights.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'blob:', 'https://beefy.com'],
        'connect-src': [
          "'self'",
          'https:',
          'https://cloudflareinsights.com',
          'wss://relay.walletconnect.org',
          'wss://www.walletlink.org',
          'wss://metamask-sdk.api.cx.metamask.io',
        ],
        'frame-src': ["'self'", 'https://verify.walletconnect.org', 'https://fwd.metamask.io'],
        'worker-src': ["'self'"],
        'manifest-src': ["'self'"],
        'media-src': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'upgrade-insecure-requests': true,
      },
    }),
    ...optionalPlugins,
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  build: {
    outDir: 'build',
    reportCompressedSize: false,
    assetsInlineLimit: 0,
    sourcemap: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/entry-[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
      treeshake: {
        manualPureFunctions: [
          'memo',
          'lazy',
          'legacyMakeStyles',
          'createAsyncThunk',
          'createSlice',
          'createSelector',
          'createCachedSelector',
          'createHasLoaderFulfilledRecentlyEvaluator',
          'createHasLoaderDispatchedRecentlyEvaluator',
          'createShouldLoaderLoadOnceEvaluator',
          'createShouldLoaderLoadRecentEvaluator',
          'createGlobalDataSelector',
          'createChainDataSelector',
          'createAddressDataSelector',
          'createAddressChainDataSelector',
          'createAddressVaultDataSelector',
          'styled',
          'sva',
          'cva',
          'css',
          'createTooltipTriggerFactory',
          'createDropdownTriggerFactory',
        ],
      },
      plugins: [RollupNodePolyFillPlugin()],
    },
  },
});
