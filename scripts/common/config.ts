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
    hash: '0x9b0d945a620022e303085619428f8476b0815be63de66c381985b1600a6ed424',
  },
  one: {
    count: 22,
    hash: '0x90ed7bc48e41fcefe008e61a93d8ef4bb9ffc10929e098c2e9963ddf64beadf8',
  },
  fuse: {
    count: 28,
    hash: '0x684a1f39fbb159ed063810479c1d0fcc8c9dfbc200238442582e9916becf660e',
  },
  emerald: {
    count: 10,
    hash: '0x8bc8e4abf4228c9dcf41bf674a325cddfc0956bad8af1c4d6a57a340057fcd67',
  },
  mantle: {
    count: 21,
    hash: '0x466daa5ec59bda0b5b61819146a8026e20c3024126fb64d92fb8f9a458fb6e52',
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
