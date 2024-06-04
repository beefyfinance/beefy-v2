import type { Plugin } from 'vite';
import { exec } from 'node:child_process';
import type { OutputBundle } from 'rollup';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { transform } from 'esbuild';

export default function (): Plugin {
  type BuildVersion = {
    content: string;
    timestamp: number;
    git: string | undefined;
  };

  async function getGitHashOrUndefined(): Promise<string | undefined> {
    return new Promise(resolve => {
      exec('git rev-parse HEAD', (error, stdout) => {
        if (error) {
          console.warn('Failed to get git hash, version.git will be undefined');
          resolve(undefined);
        } else {
          const output = stdout.toString()?.replace('\n', '');
          resolve(output || undefined);
        }
      });
    });
  }

  function getContentHash(bundle: OutputBundle): string {
    return createHash('md5')
      .update(JSON.stringify(Object.keys(bundle).sort()))
      .digest('hex');
  }

  function getCloudflareHeaders(version: BuildVersion) {
    return `/*
  X-Git-Commit: ${version.git || 'undefined'}
  X-Build-Timestamp: ${version.timestamp}
  X-Content-Hash: ${version.content}
`;
  }

  async function getCheckerScript(version: BuildVersion) {
    const code = await readFile(path.resolve(__dirname, 'version-checker.ts'), 'utf-8');
    const codeWithVersion = code.replace(
      "'$$VERSION_PLACEHOLDER$$'",
      JSON.stringify(JSON.stringify(version))
    );
    const minified = await transform(codeWithVersion, { minify: true, loader: 'ts' });

    return `<script>${minified.code}</script>`;
  }

  return {
    name: 'version-plugin',
    enforce: 'post',
    apply: 'build',
    async generateBundle(options, bundle) {
      const content = getContentHash(bundle);
      const timestamp = Math.floor(Date.now() / 1000);
      const git = await getGitHashOrUndefined();
      const version = { content, timestamp, git };

      this.emitFile({
        fileName: 'version.json',
        type: 'asset',
        source: JSON.stringify(version),
      });

      this.emitFile({
        fileName: '_headers',
        type: 'asset',
        source: getCloudflareHeaders(version),
      });

      const index = bundle['index.html'];
      if (index && index.type === 'asset' && typeof index.source === 'string') {
        const checkerScript = await getCheckerScript(version);
        index.source = index.source.replace('</body>', `${checkerScript}</body>`);
      }
    },
  };
}
