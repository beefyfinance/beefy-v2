import { transformWithEsbuild, type Plugin } from 'vite';
import { exec } from 'node:child_process';
import type { OutputBundle } from 'rollup';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getHeadersApi, type HeadersPluginApi } from './headers-plugin.ts';

// eslint-disable-next-line no-restricted-syntax -- required for Vite plugin
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
    const hash = createHash('md5');
    for (const key of Object.keys(bundle).sort()) {
      hash.update(key);
    }
    return hash.digest('hex');
  }

  async function getCheckerScript(version: BuildVersion) {
    const filePath = path.resolve(__dirname, 'version-checker.ts');
    const code = await readFile(filePath, 'utf-8');
    const codeWithVersion = code.replace(
      "'$$VERSION_PLACEHOLDER$$'",
      JSON.stringify(JSON.stringify(version))
    );
    const minified = await transformWithEsbuild(codeWithVersion, filePath, {
      minify: true,
      minifyWhitespace: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      loader: 'ts',
    });

    return `<script>${minified.code}</script>`;
  }

  let headers: HeadersPluginApi;

  return {
    name: 'version-plugin',
    enforce: 'post',
    apply: 'build',
    configResolved(config) {
      headers = getHeadersApi(config);
    },
    async generateBundle(_options, bundle) {
      const content = getContentHash(bundle);
      const timestamp = Math.floor(Date.now() / 1000);
      const git = await getGitHashOrUndefined();
      const version = { content, timestamp, git };

      this.emitFile({
        fileName: 'version.json',
        type: 'asset',
        source: JSON.stringify(version),
      });

      headers.add('/*', {
        'X-Git-Commit': version.git || 'undefined',
        'X-Build-Timestamp': `${version.timestamp}`,
        'X-Content-Hash': version.content,
      });

      const index = bundle['index.html'];
      if (index && index.type === 'asset' && typeof index.source === 'string') {
        const checkerScript = await getCheckerScript(version);
        index.source = index.source.replace('</body>', `${checkerScript}</body>`);
      }
    },
  };
}
