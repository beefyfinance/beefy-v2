import { config } from '../../src/config/config';
import lodash from 'lodash';
import type {
  AmmConfig,
  BoostConfig,
  MinterConfig,
  VaultConfig,
} from '../../src/features/data/apis/config-types';

/** Harmony->One to match addressbook */
const chainConfigs = Object.fromEntries(
  Object.entries(config).map(([chainId, chainConfig]) => [appToAddressBookId(chainId), chainConfig])
);

export type ChainConfig = (typeof chainConfigs)[keyof typeof chainConfigs];

/**
 * What chains to exclude from chainIds array and thus any validation
 * Use `yarn makeExcludeConfig chain` to generate the hash
 * Key must be the addressbook/api chain id, not app chain id (i.e. use one over harmony)
 * */
export const excludeChains: Record<string, { count: number; hash: string }> = {
  heco: {
    count: 35,
    hash: 'ccab3fea9945e6474f803946d72001a04245fb2556f340ebee7a65af61be4773',
  },
  one: {
    count: 22,
    hash: '104ab490f7be1037e0a8b5c545db505cd2ae644ba73fd958d33ab9435202e00a',
  },
  fuse: {
    count: 28,
    hash: '496b1a976f7d822f32cb4d19e570aa77ea3aef6a0ad77045146c9039c12e9f17',
  },
  emerald: {
    count: 10,
    hash: 'f74673e540c41ec7ab283c9d07ac2090453ab34be8824e8178c0a853fcaf80b1',
  },
  mantle: {
    count: 28,
    hash: '7bde62e7e6f90ad6bdaf31a7b7c54f26d78c2388f7c68ee97a2899e3ab143018',
  },
};

export const excludedChainIds = Object.keys(excludeChains);
export const allChainIds: string[] = Object.keys(chainConfigs);
export const chainIds: string[] = allChainIds.filter(chainId => !(chainId in excludeChains));
export const chainRpcs: Record<string, string> = Object.fromEntries(
  allChainIds.map(chainId => [
    chainId,
    process.env[`${addressBookToAppId(chainId).toUpperCase()}_RPC`] ||
      lodash.sample(chainConfigs[chainId].rpc)!,
  ])
);

const vaultsByChainId = {};

export function getChain(chainId: string): ChainConfig {
  const addressBookId = appToAddressBookId(chainId);
  const config = chainConfigs[addressBookId];
  if (!config) {
    throw new Error(`No config for chain ${chainId}`);
  }
  return config;
}

export async function getVaultsForChain(chainId: string): Promise<VaultConfig[]> {
  const id = addressBookToAppId(chainId);

  if (!(id in vaultsByChainId)) {
    vaultsByChainId[id] = (await import(`../../src/config/vault/${id}.json`)).default;
  }

  return vaultsByChainId[id];
}

const boostsByChainId = {};

export async function getBoostsForChain(chainId: string): Promise<BoostConfig[]> {
  const id = addressBookToAppId(chainId);

  if (!(id in boostsByChainId)) {
    boostsByChainId[id] = (await import(`../../src/config/boost/${id}.json`)).default;
  }

  return boostsByChainId[id];
}

const ammsByChainId = {};

export async function getAmmsForChain(chainId: string): Promise<AmmConfig[]> {
  const id = addressBookToAppId(chainId);

  if (!(id in ammsByChainId)) {
    ammsByChainId[id] = (await import(`../../src/config/zap/amm/${id}.json`)).default;
  }

  return ammsByChainId[id];
}

const mintersByChainId = {};

export async function getMintersForChain(chainId: string): Promise<MinterConfig[]> {
  const id = addressBookToAppId(chainId);

  if (!(id in mintersByChainId)) {
    mintersByChainId[id] = (await import(`../../src/config/minters/${id}.tsx`)).minters;
  }

  return mintersByChainId[id];
}

export function appToAddressBookId(chainId: string) {
  return chainId === 'harmony' ? 'one' : chainId;
}

export function addressBookToAppId(chainId: string) {
  return chainId === 'one' ? 'harmony' : chainId;
}
