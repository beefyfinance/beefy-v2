import { BeefyAPI } from './beefy';
import { ConfigAPI } from './config';
import { sample } from 'lodash';
import { createFactoryWithCacheByChain } from '../utils/factory-utils';
import { ChainEntity } from '../entities/chain';
import {
  featureFlag_getAllowanceApiImplem,
  featureFlag_getBalanceApiImplem,
  featureFlag_getContractDataApiImplem,
} from '../utils/feature-flags';
import { IWalletConnectionApi, WalletConnectionOptions } from './wallet/wallet-connection-types';

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

const Web3Promise = import('web3');
export const getWeb3Instance = createFactoryWithCacheByChain(async chain => {
  const Web3 = await Web3Promise;

  // pick one RPC endpoint at random
  // todo: not the smartest thing to do but good enough yet
  const rpc = sample(chain.rpc);
  console.debug(`Instanciating Web3 for chain ${chain.id}`);
  return new Web3.default(rpc);
});

const ContractDataAPIPromise = import('./contract-data');
export const getContractDataApi = createFactoryWithCacheByChain(async chain => {
  const { ContractDataAPI, ContractDataMcV2API } = await ContractDataAPIPromise;

  const web3 = await getWeb3Instance(chain);

  let targetImplem = featureFlag_getContractDataApiImplem();
  if (targetImplem === 'new-multicall' && !chain.fetchBalancesAddress) {
    targetImplem = 'eth-multicall';
  }
  if (targetImplem === 'new-multicall') {
    // only if we have a contract to work with
    console.debug(`Instanciating ContractDataMcV2API for chain ${chain.id}`);
    return new ContractDataMcV2API(
      web3,
      chain as ChainEntity & { fetchContractDataAddress: string }
    );
  }
  console.debug(`Instanciating ContractDataAPI for chain ${chain.id}`);
  return new ContractDataAPI(web3, chain);
});

const BalanceAPIPromise = import('./balance');
export const getBalanceApi = createFactoryWithCacheByChain(async chain => {
  const { BalanceAPI, BalanceMcV2API } = await BalanceAPIPromise;

  const web3 = await getWeb3Instance(chain);

  let targetImplem = featureFlag_getBalanceApiImplem();
  if (targetImplem === 'new-multicall' && !chain.fetchBalancesAddress) {
    targetImplem = 'eth-multicall';
  }

  if (targetImplem === 'new-multicall') {
    console.debug(`Instanciating BalanceMcV2API for chain ${chain.id}`);
    return new BalanceMcV2API(web3, chain as ChainEntity & { fetchBalancesAddress: string });
  }

  console.debug(`Instanciating BalanceAPI for chain ${chain.id}`);
  return new BalanceAPI(web3, chain);
});

const AllowanceAPIPromise = import('./allowance');
export const getAllowanceApi = createFactoryWithCacheByChain(async chain => {
  const { AllowanceAPI, AllowanceMcV2API } = await AllowanceAPIPromise;

  const web3 = await getWeb3Instance(chain);

  let targetImplem = featureFlag_getAllowanceApiImplem();
  if (targetImplem === 'new-multicall' && !chain.fetchBalancesAddress) {
    targetImplem = 'eth-multicall';
  }

  if (targetImplem === 'new-multicall') {
    console.debug(`Instanciating AllowanceMcV2API for chain ${chain.id}`);
    return new AllowanceMcV2API(web3, chain as ChainEntity & { fetchBalancesAddress: string });
  }

  console.debug(`Instanciating AllowanceAPI for chain ${chain.id}`);
  return new AllowanceAPI(web3, chain);
});

let walletConnection: IWalletConnectionApi | null = null;
export async function getWalletConnectionApiInstance(
  options?: WalletConnectionOptions
): Promise<IWalletConnectionApi> {
  if (!options && !walletConnection) {
    throw new Error('Please initialize wallet instance');
  }
  if (!walletConnection) {
    // allow code splitting to put all wallet connect stuff
    // in a separate, non-critical-path js file
    const { WalletConnectionApi } = await import('./wallet/wallet-connection');
    walletConnection = new WalletConnectionApi(options);
  }
  return walletConnection;
}
