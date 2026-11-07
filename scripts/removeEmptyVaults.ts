import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { groupBy, sortBy } from 'lodash-es';
import { type ArgumentConfig, parse } from 'ts-command-line-args';
import type { Address } from 'viem';
import {
  type AddressBookChainId,
  addressBookToAppId,
  allChainIds,
  appToAddressBookId,
  chainIds,
  excludedChainIds,
  getVaultsForChain,
} from './common/config.ts';
import { getViemClient } from './common/viem.ts';
import { saveJson } from './common/files.ts';
import { ERC20Abi } from '../src/config/abi/ERC20Abi.ts';
import type { VaultConfig } from '../src/features/data/apis/config-types.ts';

type RunArgs = {
  help?: boolean;
  chain?: string[];
  'dry-run'?: boolean;
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
    alias: 'c',
    multiple: true,
    description:
      'Only remove vaults on these chains (required for chains excluded from validation)',
    optional: true,
  },
  'dry-run': {
    type: Boolean,
    alias: 'd',
    description: 'List the vaults that would be removed without changing any files',
    optional: true,
  },
};

function getRunArgs() {
  return parse<RunArgs>(runArgsConfig, {
    helpArg: 'help',
    headerContentSections: [
      {
        header: 'npm run removeEmptyVaults',
        content: 'Remove vaults with zero totalSupply from the chain json files',
      },
    ],
  });
}

type ChainVault = {
  chainId: AddressBookChainId;
  vault: VaultConfig;
};

const configVaultDir = 'src/config/vault';

const warnings: Array<{ chain: string; id: string; message: string }> = [];

function warn(chainId: AddressBookChainId, id: string, message: string) {
  warnings.push({ chain: addressBookToAppId(chainId), id, message });
}

function printWarnings() {
  for (const { chain, id, message } of sortBy(warnings, ['chain', 'id'])) {
    console.warn(`[WARN] ${chain}${id ? ` ${id}` : ''}: ${message}`);
  }
}

async function getTotalSupplies(
  chainId: AddressBookChainId,
  vaults: VaultConfig[]
): Promise<bigint[]> {
  const results = await getViemClient(addressBookToAppId(chainId)).multicall({
    contracts: vaults.map(vault => ({
      address: vault.earnContractAddress as Address,
      abi: ERC20Abi,
      functionName: 'totalSupply' as const,
    })),
    allowFailure: true,
  });

  return results.map((result, i) => {
    if (result.status === 'failure') {
      throw new Error(`${addressBookToAppId(chainId)} ${vaults[i].id}: totalSupply() failed`, {
        cause: result.error,
      });
    }
    return result.result;
  });
}

async function getRemovableVaults(chainId: AddressBookChainId): Promise<ChainVault[]> {
  const vaults = await getVaultsForChain(chainId);
  const nonGovVaults = vaults.filter(vault => vault.type !== 'gov');
  const totalSupplies = await getTotalSupplies(chainId, nonGovVaults);
  const supplies = new Map(nonGovVaults.map((vault, i) => [vault, totalSupplies[i]]));
  const empty = new Set(nonGovVaults.filter(vault => supplies.get(vault) === 0n));
  const byTokenAddress = groupBy(vaults, vault => vault.tokenAddress?.toLowerCase());

  for (const clm of vaults) {
    if (clm.type !== 'cowcentrated' || !empty.has(clm)) {
      continue;
    }
    for (const vault of byTokenAddress[clm.earnContractAddress.toLowerCase()] ?? []) {
      if (vault.type !== 'gov' && !empty.has(vault)) {
        warn(
          chainId,
          vault.id,
          `totalSupply is ${supplies.get(vault)} but CLM ${clm.id} is empty, removing`
        );
      }
      empty.add(vault);
    }
  }

  return vaults.filter(vault => empty.has(vault)).map(vault => ({ chainId, vault }));
}

function tokenize(content: string): string[] {
  return content.toLowerCase().split(/[\s"'`/,?#&]+/);
}

async function getSourceFiles(): Promise<Array<{ source: string; content: string }>> {
  const files = (await readdir('src', { recursive: true }))
    .map(file => join('src', file))
    .filter(file => /\.(json|ts|tsx)$/.test(file) && !file.startsWith(configVaultDir));
  return Promise.all(
    files.map(async file => ({ source: file, content: await readFile(file, 'utf-8') }))
  );
}

async function getKeptVaults(removed: ChainVault[]): Promise<ChainVault[]> {
  const removedIds = new Set(removed.map(({ vault }) => vault.id));
  const all = await Promise.all(
    allChainIds.map(async chainId =>
      (await getVaultsForChain(chainId)).map(vault => ({ chainId, vault }))
    )
  );
  return all.flat().filter(({ vault }) => !removedIds.has(vault.id));
}

async function findReferences(removed: ChainVault[]): Promise<Map<string, Set<string>>> {
  const keys = new Map<string, string[]>();
  const addKey = (key: string, id: string) => keys.set(key, [...(keys.get(key) ?? []), id]);
  for (const { chainId, vault } of removed) {
    addKey(vault.id.toLowerCase(), vault.id);
    addKey(vault.earnContractAddress.toLowerCase(), vault.id);
    addKey(`${chainId}:${vault.earnContractAddress.toLowerCase()}`, vault.id);
  }

  const refs = new Map<string, Set<string>>();
  const scan = (content: string, source: string, chainId?: AddressBookChainId) => {
    for (const token of tokenize(content)) {
      const ids =
        token.startsWith('0x') && chainId ? keys.get(`${chainId}:${token}`) : keys.get(token);
      for (const id of ids ?? []) {
        refs.set(id, (refs.get(id) ?? new Set()).add(source));
      }
    }
  };

  for (const { source, content } of await getSourceFiles()) {
    scan(content, source);
  }
  for (const { chainId, vault } of await getKeptVaults(removed)) {
    scan(JSON.stringify(vault), `vault ${vault.id}`, chainId);
  }

  return refs;
}

async function main() {
  const args = getRunArgs();
  if (args.help) {
    return;
  }

  const chains = args.chain ? args.chain.map(appToAddressBookId) : chainIds;
  const removed = (await Promise.all(chains.map(getRemovableVaults))).flat();

  const removedIds = new Set(removed.map(({ vault }) => vault.id));
  const recentCutoff = Math.floor(Date.now() / 1000) - 14 * 24 * 60 * 60;
  for (const chainId of chains) {
    const existing = await getVaultsForChain(chainId);
    const chainRemoved = existing.filter(vault => removedIds.has(vault.id));
    if (chainRemoved.length === 0) {
      continue;
    }

    const appChainId = addressBookToAppId(chainId);
    for (const vault of chainRemoved) {
      if (vault.createdAt > recentCutoff) {
        warn(
          chainId,
          vault.id,
          `created ${new Date(vault.createdAt * 1000).toISOString()}, less than 2 weeks ago`
        );
      }
    }

    if (args['dry-run']) {
      chainRemoved.forEach(vault => console.log(`[DRY RUN] ${appChainId} ${vault.id}`));
      continue;
    }

    await saveJson(
      `./${configVaultDir}/${appChainId}.json`,
      existing.filter(vault => !removedIds.has(vault.id)),
      'prettier'
    );
    console.log(`[INFO] ${appChainId}: removed ${chainRemoved.map(vault => vault.id).join(', ')}`);
    if (excludedChainIds.includes(chainId)) {
      warn(
        chainId,
        '',
        `excluded from validation, update excludeChains with: npm run makeExcludeConfig ${chainId}`
      );
    }
  }

  const refs = await findReferences(removed);
  for (const { chainId, vault } of removed) {
    const sources = refs.get(vault.id);
    if (sources) {
      warn(
        chainId,
        vault.id,
        `removed, but still referenced in ${[...sources].join(', ')}; remove these references manually`
      );
    }
  }

  printWarnings();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
