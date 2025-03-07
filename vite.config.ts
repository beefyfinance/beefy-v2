import { defineConfig, type Plugin } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import RollupNodePolyFillPlugin from 'rollup-plugin-polyfill-node';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import versionPlugin from './tools/bundle/version-plugin.ts';
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
          'createFactory',
          'createCachedFactory',
          'createDependencyFactory',
          'createDependencyInitializerFactory',
          'createDependencyFactoryWithCacheByChain',
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
