import { type Plugin, transformWithEsbuild } from 'vite';
import { exec } from 'node:child_process';
import type { OutputBundle } from 'rollup';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  HeadersFilePlugin,
  HeadersFilePluginApi,
  Header,
} from './headers-file-plugin.ts';

// eslint-disable-next-line no-restricted-syntax -- required for Vite plugin
export default function (): Plugin {
  let headersApi: HeadersFilePluginApi | undefined;

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

  function getCloudflareHeaders(version: BuildVersion) {
    const headers: Header[] = [
      {
        key: 'X-Build-Timestamp',
        value: version.timestamp.toString(),
      },
      {
        key: 'X-Content-Hash',
        value: version.content,
      },
    ];
    if (version.git) {
      headers.push({
        key: 'X-Git-Commit',
        value: version.git,
      });
    }

    return {
      path: '/*',
      headers,
    };
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

  return {
    name: 'version-plugin',
    enforce: 'post',
    apply: 'build',
    buildStart({ plugins }) {
      const headersPlugin = plugins.find(
        (p): p is HeadersFilePlugin => p.name === 'headers-file-plugin'
      );
      headersApi = headersPlugin?.api || undefined;
      if (!headersApi) {
        throw new Error('headers-file-plugin not found, required by version-plugin');
      }
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

      if (headersApi) {
        const pathHeaders = getCloudflareHeaders(version);
        headersApi.addHeaders(pathHeaders.path, pathHeaders.headers);
      } else {
        throw new Error('headers-file-plugin not found, required by version-plugin');
      }

      const index = bundle['index.html'];
      if (index && index.type === 'asset' && typeof index.source === 'string') {
        const checkerScript = await getCheckerScript(version);
        index.source = index.source.replace('</body>', `${checkerScript}</body>`);
      }
    },
  };
}
