// To run: npm run retireChain -- <chainId>
// Example: npm run retireChain -- mantle
import { readFile, writeFile } from 'node:fs/promises';
import * as prettier from 'prettier';
import { type ArgumentConfig, parse } from 'ts-command-line-args';
import { config } from '../src/config/config.ts';
import type { VaultConfig } from '../src/features/data/apis/config-types.ts';
import { loadJson, saveJson } from './common/files.ts';
import { sortVaultKeys } from './common/vault-fields.ts';

type RunArgs = {
  help?: boolean;
  chain: string;
};

const runArgsConfig: ArgumentConfig<RunArgs> = {
  help: {
    type: Boolean,
    alias: 'h',
    description: 'Display this usage guide.',
    optional: true,
  },
  chain: {
    type: String,
    defaultOption: true,
    description: 'Chain id to retire (e.g. mantle, metis)',
  },
};

function getRunArgs() {
  return parse<RunArgs>(runArgsConfig, {
    helpArg: 'help',
    headerContentSections: [
      {
        header: 'npm run retireChain',
        content:
          'Retire a chain: EOLs all active vaults via setVaultStatus and adds eol timestamp to config.ts, re-sorting chains (active A-Z first, then EOL by timestamp).',
      },
    ],
  });
}

type ConfigEntry = {
  key: string;
  eol?: number;
};

function parseConfigEntries(source: string): ConfigEntry[] {
  const entries: ConfigEntry[] = [];
  // Match each top-level key in the config object
  const keyRegex = /^\s{2}(\w+):\s*\{/gm;
  let match;
  while ((match = keyRegex.exec(source)) !== null) {
    const key = match[1];
    const chainConfig = (config as Record<string, { eol?: number }>)[key];
    entries.push({ key, eol: chainConfig?.eol });
  }
  return entries;
}

function buildSortedConfig(
  source: string,
  entries: ConfigEntry[],
  chainToRetire: string,
  timestamp: number
): string {
  // Extract each chain's block of source text
  const blocks: Record<string, string> = {};
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    // Find the start of this chain's key in source
    const startRegex = new RegExp(`^(\\s{2}${entry.key}:\\s*\\{)`, 'm');
    const startMatch = startRegex.exec(source);
    if (!startMatch) continue;

    const blockStart = startMatch.index;
    // Find closing: look for next top-level key or the closing of config object
    let braceDepth = 0;
    let blockEnd = blockStart;
    let foundOpen = false;
    for (let j = blockStart; j < source.length; j++) {
      if (source[j] === '{') {
        braceDepth++;
        foundOpen = true;
      } else if (source[j] === '}') {
        braceDepth--;
        if (foundOpen && braceDepth === 0) {
          blockEnd = j + 1;
          break;
        }
      }
    }

    let block = source.slice(blockStart, blockEnd);

    // If this is the chain being retired, inject eol timestamp after the opening brace
    if (entry.key === chainToRetire) {
      entry.eol = timestamp;
      // Add eol after "chainKey: {" line, before the name line
      block = block.replace(/^(\s{2}\w+:\s*\{)\n(\s{4}name:)/m, `$1\n    eol: ${timestamp},\n$2`);
    }

    blocks[entry.key] = block;
  }

  // Sort: active chains (no eol) alphabetically, then eol chains by timestamp ascending
  const active = entries.filter(e => !e.eol).sort((a, b) => a.key.localeCompare(b.key));
  const eol = entries.filter(e => !!e.eol).sort((a, b) => (b.eol ?? 0) - (a.eol ?? 0));
  const sorted = [...active, ...eol];

  // Rebuild config source
  const header = source.slice(0, source.indexOf('\n', source.indexOf('export const config')) + 1);
  const footer = `} satisfies Record<ChainConfig['id'], Omit<ChainConfig, 'id'>>;\n`;

  const body = sorted.map((entry, i) => {
    const block = blocks[entry.key];
    const isLast = i === sorted.length - 1;
    return block + (isLast ? '' : ',');
  });

  return header + body.join('\n') + '\n' + footer;
}

async function main() {
  const args = getRunArgs();
  if (args.help) return;

  const chainId = args.chain;
  if (!(chainId in config)) {
    console.error(`[ERROR] Chain "${chainId}" not found in config.ts`);
    process.exit(1);
  }

  const chainConfig = (config as Record<string, { eol?: number }>)[chainId];
  if (chainConfig.eol) {
    console.error(`[ERROR] Chain "${chainId}" is already EOL (eol: ${chainConfig.eol})`);
    process.exit(1);
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // 1. EOL all active/paused vaults and clean up pause fields
  const vaultsFile = `./src/config/vault/${chainId}.json`;
  const vaults = await loadJson<VaultConfig[]>(vaultsFile);
  const vaultsToRetire = vaults.filter(v => v.status === 'active' || v.status === 'paused');

  if (vaultsToRetire.length > 0) {
    console.log(`[INFO] Setting ${vaultsToRetire.length} active/paused vaults to eol...`);
    const modified = vaults.map(v => {
      if (v.status !== 'active' && v.status !== 'paused') {
        // Already eol: just clean up stale pause fields
        const { pausedAt: _pausedAt, pauseReason: _pauseReason, ...rest } = v;
        if (_pausedAt || _pauseReason) {
          return sortVaultKeys(rest as VaultConfig);
        }
        return v;
      }
      const { pausedAt: _pa, pauseReason: _pr, ...rest } = v;
      return sortVaultKeys({
        ...rest,
        status: 'eol',
        retireReason: 'rewards',
        retiredAt: timestamp,
      } as VaultConfig);
    });
    await saveJson(vaultsFile, modified, 'prettier');
    console.log(`[INFO] ${vaultsToRetire.length} vaults set to eol`);
  } else {
    console.log(`[INFO] No active/paused vaults on ${chainId}`);
  }

  // 2. Update config.ts: add eol timestamp and re-sort chains
  const configPath = './src/config/config.ts';
  const source = await readFile(configPath, 'utf-8');
  const entries = parseConfigEntries(source);

  const newSource = buildSortedConfig(source, entries, chainId, timestamp);

  // Format with prettier
  const prettierConfig = await prettier.resolveConfig(configPath);
  const formatted = await prettier.format(newSource, { ...prettierConfig, filepath: configPath });
  await writeFile(configPath, formatted, 'utf-8');

  console.log(`[INFO] Added eol: ${timestamp} to ${chainId} in config.ts and re-sorted chains`);
  console.log(`[DONE] Chain "${chainId}" retired successfully`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
