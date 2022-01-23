import { BeefyAPI } from './beefy';
import { ConfigAPI } from './config';
import { VaultContractAPI } from './vault-contract';
import { BoostContractAPI } from './boost-contract';
import { ChainEntity } from '../entities/chain';
import Web3 from 'web3';
import { BalanceAPI } from './balance';

// todo: maybe don't instanciate here, idk yet
const beefyApi = new BeefyAPI();
const configApi = new ConfigAPI();

/**
 * These are basically factories so user code don't have to worry
 * about creating those API objects
 */

export async function getBeefyApi(): Promise<BeefyAPI> {
  return beefyApi;
}
export async function getConfigApi(): Promise<ConfigAPI> {
  return configApi;
}

export const getWeb3Instance = createFactoryWithCacheByChain(async chain => {
  // pick one RPC endpoint at random
  // todo: not the smartest thing to do but good enough yet
  const rpc = chain.rpc[~~(chain.rpc.length * Math.random())];
  console.debug(`Instanciating Web3 for chain ${chain.id}`);
  return new Web3(rpc);
});

export const getVaultContractApi = createFactoryWithCacheByChain(async chain => {
  const web3 = await getWeb3Instance(chain);
  console.debug(`Instanciating VaultContractAPI for chain ${chain.id}`);
  return new VaultContractAPI(web3, chain);
});

export const getBoostContractApi = createFactoryWithCacheByChain(async chain => {
  const web3 = await getWeb3Instance(chain);
  console.debug(`Instanciating BoostContractAPI for chain ${chain.id}`);
  return new BoostContractAPI(web3, chain);
});

export const getBalanceApi = createFactoryWithCacheByChain(async chain => {
  const web3 = await getWeb3Instance(chain);
  console.debug(`Instanciating BalanceAPI for chain ${chain.id}`);
  return new BalanceAPI(web3, chain);
});

/**
 * Creates a new factory function based on the input factory function
 * Adds an instance cache by chain to have exactly one instance by chain
 */
function createFactoryWithCacheByChain<T>(
  factoryFn: (chainId: ChainEntity) => Promise<T>
): (chainId: ChainEntity) => Promise<T> {
  const cacheByChainId: { [chainId: ChainEntity['id']]: T } = {};

  return async (chain: ChainEntity): Promise<T> => {
    if (cacheByChainId[chain.id] === undefined) {
      cacheByChainId[chain.id] = await factoryFn(chain);
    }
    return cacheByChainId[chain.id];
  };
}
