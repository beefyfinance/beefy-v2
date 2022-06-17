import { config } from '../src/config/config';
import lodash from 'lodash';

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
    process.env[`${chainId.toUpperCase()}_RPC`] || lodash.sample(chainConfigs[chainId].rpc),
  ])
);

const vaultsByChainId = {};
export async function getVaultsForChain(chainId: string) {
  const id = addressBookToAppId(chainId);

  if (!(id in vaultsByChainId)) {
    vaultsByChainId[id] = (await import(`../src/config/vault/${id}.json`)).default;
  }

  return vaultsByChainId[id];
}

function appToAddressBookId(chainId: string) {
  return chainId === 'harmony' ? 'one' : chainId;
}

function addressBookToAppId(chainId: string) {
  return chainId === 'one' ? 'harmony' : chainId;
}
