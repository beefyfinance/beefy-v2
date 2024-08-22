import { sample } from 'lodash';
import { ChainId } from 'blockchain-addressbook';
import { config } from '../../src/config/config';
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

export type AddressBookChainId = keyof typeof ChainId;
export type AppChainId = keyof typeof config;
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
  aurora: {
    count: 24,
    hash: '13d2d19d7c96406a0d46042c521b6d7e19ee63b94474916a21eb2f1d69c15f57',
  },
  celo: {
    count: 14,
    hash: 'fe0549fd08678e577d17796df5b36ce28e4546bd9a1cc652196c6fa85bcaa482',
  },
  moonriver: {
    count: 53,
    hash: '17e6fa948469e3d796f3709d39bb01cc4b0ded28cbd30bcbd252eb719a1c0e39',
  },
  canto: {
    count: 36,
    hash: '263fc197d9d5447d4a47854cf12dd8abac9c891573dedeb6db3d14ebdc75cc53',
  },
};

export const excludedChainIds = Object.keys(excludeChains);
export const allChainIds: string[] = Object.keys(chainConfigs);
export const chainIds: string[] = allChainIds.filter(chainId => !(chainId in excludeChains));
export const chainRpcs: Record<string, string> = Object.fromEntries(
  allChainIds.map(chainId => [
    chainId,
    process.env[`${addressBookToAppId(chainId).toUpperCase()}_RPC`] ||
      sample(chainConfigs[chainId].rpc)!,
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

export function appToAddressBookId(chainId: string): AddressBookChainId {
  if (chainId === 'harmony') {
    return 'one';
  }
  if (chainId in ChainId) {
    return chainId as AddressBookChainId;
  }
  throw new Error(`Unknown app chain id ${chainId}`);
}

export function addressBookToAppId(chainId: string): AppChainId {
  if (chainId === 'one') {
    return 'harmony';
  }
  if (chainId in config) {
    return chainId as AppChainId;
  }
  throw new Error(`Unknown address book chain id ${chainId}`);
}
