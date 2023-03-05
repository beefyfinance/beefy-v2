import { defineConfig } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import RollupNodePolyFillPlugin from 'rollup-plugin-polyfill-node';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import * as path from 'path';

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
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      plugins: [RollupNodePolyFillPlugin()],
    },
  },
  resolve: {
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
