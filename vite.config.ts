import { defineConfig, type Plugin } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import RollupNodePolyFillPlugin from 'rollup-plugin-polyfill-node';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';
import { visualizer } from 'rollup-plugin-visualizer';
import * as path from 'path';

const optionalPlugins: Plugin[] = [];

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

function getChunkName(absolutePath: string): string | undefined {
  const relativePath = path.relative(__dirname, absolutePath).replace(/\\/g, '/');
  const parts = relativePath.split('/');
  if (parts.length < 2) {
    return;
  }

  if (parts[0] === 'node_modules') {
    const packageParts = parts.slice(1);
    let packageName = packageParts[0];
    if (packageName.startsWith('@')) {
      packageName = packageName.substring(1);
      if (packageParts.length > 1) {
        packageName += '-' + packageParts[1];
      }
    }
    return packageName.toLowerCase();
  }

  if (parts[0] === 'src') {
    return parts[parts.length - 2].toLowerCase();
  }
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
      output: {
        entryFileNames: entryInfo => {
          if (entryInfo.name === 'index') {
            if (entryInfo.facadeModuleId) {
              const chunkName = getChunkName(entryInfo.facadeModuleId);
              if (chunkName) {
                return `assets/entry-${chunkName}-[name]-[hash].js`;
              }
            }
          }
          return 'assets/entry-[name]-[hash].js';
        },
        chunkFileNames: chunkInfo => {
          if (chunkInfo.name === 'index') {
            if (chunkInfo.facadeModuleId) {
              const chunkName = getChunkName(chunkInfo.facadeModuleId);
              if (chunkName) {
                return `assets/${chunkName}-[name]-[hash].js`;
              }
            } else {
            }
          }
          return 'assets/[name]-[hash].js';
        },
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
