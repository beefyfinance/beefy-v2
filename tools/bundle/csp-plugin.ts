import type { Plugin } from 'vite';
import type { OutputAsset } from 'rollup';
import { createHash } from 'node:crypto';
import { getHeadersApi, type HeadersPluginApi } from './headers-plugin.ts';

/** Directive name to source list; `true` for valueless directives like upgrade-insecure-requests */
export type CspDirectives = Record<string, string[] | true>;

export type CspPluginOptions = {
  directives: CspDirectives;
  /** Emit Content-Security-Policy-Report-Only instead of enforcing */
  reportOnly?: boolean;
  /** Violation report endpoint URL, sent via Reporting-Endpoints and the report-to directive */
  reportTo?: string;
};

const REPORT_TO_GROUP = 'csp';

function getInlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  for (const match of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1] || '';
    const content = match[2];
    if (/\ssrc\s*=/i.test(attrs) || !content) {
      continue;
    }
    hashes.push(`'sha256-${createHash('sha256').update(content, 'utf8').digest('base64')}'`);
  }
  return hashes;
}

function withScriptHashes(directives: CspDirectives, hashes: string[]): CspDirectives {
  if (!hashes.length) {
    return directives;
  }
  const target = ['script-src', 'default-src'].find(name => Array.isArray(directives[name]));
  if (!target) {
    throw new Error(
      `index.html has inline scripts but no script-src/default-src directive to attach hashes to`
    );
  }
  return {
    ...directives,
    [target]: [...(directives[target] as string[]), ...hashes],
  };
}

function withReportTo(directives: CspDirectives): CspDirectives {
  if ('report-to' in directives) {
    throw new Error('report-to directive is set by the reportTo option');
  }
  return { ...directives, 'report-to': [REPORT_TO_GROUP] };
}

function getReportingEndpoints(reportTo: string): string {
  const url = new URL(reportTo);
  if (url.protocol !== 'https:') {
    throw new Error(`reportTo must be an https URL: ${reportTo}`);
  }
  return `${REPORT_TO_GROUP}="${url.href}"`;
}

function serializePolicy(directives: CspDirectives): string {
  return Object.entries(directives)
    .map(([name, value]) => (value === true ? name : `${name} ${value.join(' ')}`))
    .join('; ');
}

function assetSourceToString(asset: OutputAsset): string {
  return typeof asset.source === 'string' ? asset.source : Buffer.from(asset.source).toString();
}

// eslint-disable-next-line no-restricted-syntax -- required for Vite plugin
export default function ({ directives, reportOnly = false, reportTo }: CspPluginOptions): Plugin {
  const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
  const policyDirectives = reportTo ? withReportTo(directives) : directives;
  const reportingEndpoints = reportTo ? getReportingEndpoints(reportTo) : undefined;
  let headers: HeadersPluginApi;

  return {
    name: 'csp-plugin',
    enforce: 'post',
    apply: 'build',
    configResolved(config) {
      headers = getHeadersApi(config);
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const index = bundle['index.html'];
        if (!index || index.type !== 'asset') {
          throw new Error('index.html not found in bundle');
        }
        const hashes = getInlineScriptHashes(assetSourceToString(index));
        headers.add('/*', {
          [headerName]: serializePolicy(withScriptHashes(policyDirectives, hashes)),
          ...(reportingEndpoints ? { 'Reporting-Endpoints': reportingEndpoints } : {}),
        });
      },
    },
  };
}
