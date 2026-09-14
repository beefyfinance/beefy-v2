import type { Plugin, ResolvedConfig } from 'vite';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Path pattern (e.g. "/*") to header name to header value */
type HeaderRules = Map<string, Map<string, string>>;

export type HeadersPluginApi = {
  /** Register response headers for requests matching the path pattern */
  add(pattern: string, headers: Record<string, string>): void;
};

type HeadersTarget = {
  fileName: string;
  serialize(rules: HeaderRules): string;
  parse(source: string): HeaderRules;
};

const CLOUDFLARE_LINE_LIMIT = 2000;

/** @see https://developers.cloudflare.com/pages/configuration/headers/ */
const cloudflare: HeadersTarget = {
  fileName: '_headers',
  serialize(rules) {
    const blocks: string[] = [];
    for (const [pattern, headers] of rules) {
      const lines = [pattern, ...[...headers].map(([name, value]) => `  ${name}: ${value}`)];
      for (const line of lines) {
        if (line.length > CLOUDFLARE_LINE_LIMIT) {
          throw new Error(
            `_headers line is ${line.length} chars, Cloudflare limit is ${CLOUDFLARE_LINE_LIMIT}: ${line.slice(0, 60)}...`
          );
        }
      }
      blocks.push(lines.join('\n'));
    }
    return `${blocks.join('\n\n')}\n`;
  },
  parse(source) {
    const rules: HeaderRules = new Map();
    let current: Map<string, string> | undefined;
    for (const line of source.split('\n')) {
      if (!line.trim()) {
        continue;
      }
      if (/^\s/.test(line)) {
        if (!current) {
          throw new Error(`_headers: header line before any path pattern: ${line}`);
        }
        const separator = line.indexOf(':');
        current.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
      } else {
        current = new Map();
        rules.set(line.trim(), current);
      }
    }
    return rules;
  },
};

const targets = { cloudflare };

export type HeadersPluginOptions = {
  target?: keyof typeof targets;
  /** Path pattern to headers added to every build */
  headers?: Record<string, Record<string, string>>;
};

const PLUGIN_NAME = 'headers-plugin';

export function getHeadersApi(config: ResolvedConfig): HeadersPluginApi {
  const plugin = config.plugins.find(p => p.name === PLUGIN_NAME);
  if (!plugin?.api) {
    throw new Error(`${PLUGIN_NAME} must be included in the plugin list`);
  }
  return plugin.api as HeadersPluginApi;
}

function patternToRegExp(pattern: string): RegExp {
  const source = pattern
    .split('*')
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${source}$`);
}

// eslint-disable-next-line no-restricted-syntax -- required for Vite plugin
export default function ({
  target = 'cloudflare',
  headers = {},
}: HeadersPluginOptions = {}): Plugin {
  const { fileName, serialize, parse } = targets[target];
  const rules: HeaderRules = new Map();
  let filePath = fileName;

  const api: HeadersPluginApi = {
    add(pattern, headers) {
      const existing = rules.get(pattern) || new Map<string, string>();
      for (const [name, value] of Object.entries(headers)) {
        if (existing.has(name)) {
          throw new Error(`Header "${name}" is already set for "${pattern}"`);
        }
        existing.set(name, value);
      }
      rules.set(pattern, existing);
    },
  };

  return {
    name: PLUGIN_NAME,
    apply: (_config, env) => env.command === 'build' || !!env.isPreview,
    api,
    configResolved(config) {
      filePath = path.resolve(config.root, config.build.outDir, fileName);
      if (config.publicDir && existsSync(path.join(config.publicDir, fileName))) {
        throw new Error(`${fileName} in public/ would be overwritten by ${PLUGIN_NAME}`);
      }
    },
    buildStart() {
      rules.clear();
      for (const [pattern, values] of Object.entries(headers)) {
        api.add(pattern, values);
      }
    },
    async writeBundle() {
      if (rules.size) {
        await writeFile(filePath, serialize(rules));
      }
    },
    configurePreviewServer(server) {
      const matchers = readFile(filePath, 'utf-8').then(
        source =>
          [...parse(source)].map(([pattern, headers]) => ({
            test: patternToRegExp(pattern),
            headers,
          })),
        () => {
          server.config.logger.warn(`${fileName} not found in output directory, run build first`);
          return [];
        }
      );
      server.middlewares.use((req, res, next) => {
        matchers
          .then(list => {
            const pathname = URL.parse(req.url || '/', 'http://localhost')?.pathname;
            if (!pathname) {
              return;
            }
            for (const { test, headers } of list) {
              if (test.test(pathname)) {
                for (const [name, value] of headers) {
                  res.setHeader(name, value);
                }
              }
            }
          })
          .then(() => next(), next);
      });
    },
  };
}
