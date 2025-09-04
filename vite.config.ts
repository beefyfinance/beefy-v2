import { defineConfig, type Plugin } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import RollupNodePolyFillPlugin from 'rollup-plugin-polyfill-node';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import versionPlugin from './tools/bundle/version-plugin.ts';
import miniAppPlugin from './tools/bundle/miniapp-plugin.ts';
import tsconfigPaths from 'vite-tsconfig-paths';
import { muiCompatSvgrPlugin, standardSvgrPlugin } from './tools/bundle/svgr.ts';

function getMiniAppDomain() {
  const deployUrl = process.env.DEPLOY_URL;
  let domain = process.env.MINIAPP_DOMAIN;
  if (!domain && deployUrl) {
    try {
      const url = new URL(deployUrl);
      domain = url.hostname;
    } catch (e) {
      console.warn(`Failed to parse DEPLOY_URL (${deployUrl}) as URL`, e);
    }
  }

  return domain || 'app.beefy.com';
}

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
    miniAppPlugin({
      name: 'Beefy',
      domain: getMiniAppDomain(),
      subtitle: 'Yield Optimizer',
      description: 'Earn the highest APYs on your crypto with safety and efficiency in mind',
      category: 'finance',
      tags: ['yield', 'rewards', 'crypto', 'earn', 'token'],
      tagline: 'Grow Your Crypto',
      splashBackgroundColor: '#1C1E32',
      splashImagePath: 'src/images/miniapp/splash.png',
      iconPath: 'src/images/miniapp/icon.png',
      screenshotPaths: [
        'src/images/miniapp/screenshot1.png',
        'src/images/miniapp/screenshot2.png',
        'src/images/miniapp/screenshot3.png',
      ],
      heroImagePath: 'src/images/miniapp/hero.png',
      embedImagePath: 'src/images/miniapp/embed.png',
      ogImagePath: 'src/images/miniapp/opengraph.png',
      noindex: process.env.MINIAPP_NOINDEX !== 'false',
      capabilities: ['wallet.getEthereumProvider'],
      account: {
        header:
          'eyJmaWQiOiIyMzQ0MSIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg0OTcwOTdCNzI0MEU5ZjhBRDJiNEM2RjMwQjdjQkRlYWNDODQ0MzQ1In0',
        payload: 'eyJkb21haW4iOiJhcHAuYmVlZnkuY29tIn0',
        signature:
          'AHvDs-1ibYdkLHy8GTKN8CWECX-K4f3ekxVt04mMfANQruE3RT7_hwoviz62-4H3UZPWC6uCb7fci9pd9yDi4Rs',
      },
      baseBuilderAddresses: ['0xd7Ec5766a06500e71e6695E579e4001A73Ed76A4']
    }),
    versionPlugin(),
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
  }
});
