import { defineConfig, type Plugin } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import RollupNodePolyFillPlugin from 'rollup-plugin-polyfill-node';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';
import { visualizer } from 'rollup-plugin-visualizer';
import * as path from 'node:path';
import versionPlugin from './version-plugin';

const optionalPlugins: Plugin[] = [];

if (process.env.NODE_ENV === 'development') {
  optionalPlugins.push(
    eslint({
      failOnError: false,
      failOnWarning: false,
    })
  );
}

if (process.env.ANALYZE_BUNDLE) {
  optionalPlugins.push(
    visualizer({
      template: 'treemap', // or treemap/sunburst
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'analyze.html',
    })
  );
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true,
  },
  plugins: [
    react(),
    {
      ...svgrPlugin(),
      enforce: 'post',
    },
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
        manualChunks: id => {
          if (id.includes('@material-ui')) {
            return 'material-ui';
          }
          if (id.includes('node_modules/lodash')) {
            return 'lodash';
          }
        },
      },
      treeshake: {
        manualPureFunctions: [
          'memo',
          'lazy',
          'createTheme',
          'makeStyles',
          'createAsyncThunk',
          'createSlice',
          'createSelector',
          'createCachedSelector',
          'createFactory',
          'createCachedFactory',
          'createDependencyFactory',
          'createDependencyInitializerFactory',
          'createDependencyFactoryWithCacheByChain',
          'configureStore',
          'persistStore',
          'createHasLoaderFulfilledRecentlyEvaluator',
          'createHasLoaderDispatchedRecentlyEvaluator',
          'createShouldLoaderLoadOnceEvaluator',
          'createShouldLoaderLoadRecentEvaluator',
          'createGlobalDataSelector',
          'createChainDataSelector',
          'createAddressDataSelector',
          'createAddressChainDataSelector',
          'createAddressVaultDataSelector',
        ],
      },
      plugins: [RollupNodePolyFillPlugin()],
    },
  },
  resolve: {
    preserveSymlinks: true,
    alias: [
      {
        find: /crypto-addr-codec/,
        replacement: path.resolve(
          __dirname,
          'node_modules',
          'crypto-addr-codec',
          'dist',
          'index.js'
        ),
      },
    ],
  },
});
