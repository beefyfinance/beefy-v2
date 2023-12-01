import { defineConfig } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import RollupNodePolyFillPlugin from 'rollup-plugin-polyfill-node';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';
import { visualizer } from 'rollup-plugin-visualizer';
import * as path from 'path';

const optionalPlugins = [];

if (process.env.NODE_ENV === 'development') {
  optionalPlugins.push(eslint());
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
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
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
