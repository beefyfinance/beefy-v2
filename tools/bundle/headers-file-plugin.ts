import { type Plugin } from 'vite';

export type Header = {
  key: string;
  value: string;
  /** defaults to override */
  mode?: 'override' | 'append';
};

export type HeadersFilePluginApi = {
  addHeader(path: string, header: Header): void;
  addHeaders(path: string, headers: Header[]): void;
};

/** _headers file is supported by CloudFlare Pages and Netlify (only basic syntax) */
export type HeadersFilePlugin = Omit<Plugin<HeadersFilePluginApi>, 'name'> & {
  name: 'headers-file-plugin';
}

// eslint-disable-next-line no-restricted-syntax -- required for Vite plugin
export default function (): HeadersFilePlugin {
  let pending: Record<string, Header[]> = {};

  function mergeHeaders(headers: Header[]): Headers {
    const newHeaders = new Headers();
    for (const header of headers) {
      if (header.mode === 'append') {
        newHeaders.append(header.key, header.value);
      } else {
        newHeaders.set(header.key, header.value);
      }
    }
    return newHeaders;
  }

  function buildHeaders() {
    let source = '';
    for (const [path, headers] of Object.entries(pending)) {
      const merged = mergeHeaders(headers);
      source += `${path}\n`;
      for (const [key, value] of merged.entries()) {
        source += `  ${key}: ${value}\n`;
      }
      source += `\n\n`;
    }
    pending = {};
    return source;
  }

  return {
    name: 'headers-file-plugin',
    enforce: 'post',
    apply: 'build',
    async generateBundle(_options, _bundle) {
      const source = buildHeaders();
      if (source) {
        this.emitFile({
          fileName: '_headers',
          type: 'asset',
          source,
        });
      }
    },
    api: {
      addHeader(path: string, header: Header) {
        if (!pending[path]) {
          pending[path] = [];
        }
        pending[path].push(header);
      },
      addHeaders(path: string, headers: Header[]) {
        if (!pending[path]) {
          pending[path] = [];
        }
        pending[path].push(...headers);
      }
    },
  };
}
