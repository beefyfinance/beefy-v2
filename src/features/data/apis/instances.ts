import { BeefyAPI } from './beefy';
import { ConfigAPI } from './config';
import { VaultContractAPI } from './vault-contract';
import { BoostContractAPI } from './boost-contract';
import { ChainEntity } from '../entities/chain';
import Web3 from 'web3';
import { BalanceAPI } from './balance';
import { AllowanceAPI } from './allowance';
import { WalletConnect, WalletConnectOptions } from './wallet-connect';
import { sample } from 'lodash';

// todo: maybe don't instanciate here, idk yet
const beefyApi = new BeefyAPI();
const configApi = new ConfigAPI();

/**
 * These are basically factories so user code don't have to worry
 * about creating those API objects
 */

export function getBeefyApi(): BeefyAPI {
  return beefyApi;
}
export function getConfigApi(): ConfigAPI {
  return configApi;
}

export const getWeb3Instance = createFactoryWithCacheByChain(chain => {
  // pick one RPC endpoint at random
  // todo: not the smartest thing to do but good enough yet
  const rpc = sample(chain.rpc);
  console.debug(`Instanciating Web3 for chain ${chain.id}`);
  return new Web3(rpc);
});

export const getVaultContractApi = createFactoryWithCacheByChain(chain => {
  const web3 = getWeb3Instance(chain);
  console.debug(`Instanciating VaultContractAPI for chain ${chain.id}`);
  return new VaultContractAPI(web3, chain);
});

export const getBoostContractApi = createFactoryWithCacheByChain(chain => {
  const web3 = getWeb3Instance(chain);
  console.debug(`Instanciating BoostContractAPI for chain ${chain.id}`);
  return new BoostContractAPI(web3, chain);
});

export const getBalanceApi = createFactoryWithCacheByChain(chain => {
  const web3 = getWeb3Instance(chain);
  console.debug(`Instanciating BalanceAPI for chain ${chain.id}`);
  return new BalanceAPI(web3, chain);
});

export const getAllowanceApi = createFactoryWithCacheByChain(chain => {
  const web3 = getWeb3Instance(chain);
  console.debug(`Instanciating AllowanceAPI for chain ${chain.id}`);
  return new AllowanceAPI(web3, chain);
});

let walletCo: WalletConnect | null = null;
export function getWalletConnectInstance(options: WalletConnectOptions): WalletConnect {
  if (!walletCo) {
    walletCo = new WalletConnect(options);
  }
  return walletCo;
}

/**
 * Creates a new factory function based on the input factory function
 * Adds an instance cache by chain to have exactly one instance by chain
 */
function createFactoryWithCacheByChain<T>(
  factoryFn: (chainId: ChainEntity) => T
): (chainId: ChainEntity) => T {
  const cacheByChainId: { [chainId: ChainEntity['id']]: T } = {};

  return (chain: ChainEntity): T => {
    if (cacheByChainId[chain.id] === undefined) {
      cacheByChainId[chain.id] = factoryFn(chain);
    }
    return cacheByChainId[chain.id];
  };
}
