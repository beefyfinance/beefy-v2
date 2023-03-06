import { config } from '../../src/config/config';
import lodash from 'lodash';
import { getChainAddressBook } from '../../src/features/data/apis/addressbook';
import {
  AmmConfig,
  BoostConfig,
  MinterConfig,
  VaultConfig,
} from '../../src/features/data/apis/config-types';

/** Harmony->One to match addressbook */
const chainConfigs = Object.fromEntries(
  Object.entries(config).map(([chainId, chainConfig]) => [appToAddressBookId(chainId), chainConfig])
);

/** What chains to exclude from chainIds array and thus any validation */
export const excludeChains: string[] = ['heco'];

export const allChainIds: string[] = Object.keys(chainConfigs);
export const chainIds: string[] = allChainIds.filter(chainId => !excludeChains.includes(chainId));
export const chainRpcs: Record<string, string> = Object.fromEntries(
  allChainIds.map(chainId => [
    chainId,
    process.env[`${addressBookToAppId(chainId).toUpperCase()}_RPC`] ||
      lodash.sample(chainConfigs[chainId].rpc),
  ])
);

const vaultsByChainId = {};
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
    ammsByChainId[id] = (await import(`../../src/config/amm/${id}.json`)).default;
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
