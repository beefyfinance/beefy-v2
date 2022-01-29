import { BeefyAPI } from './beefy';
import { ConfigAPI } from './config';
import Web3 from 'web3';
import * as Comlink from 'comlink';
import { BalanceAPI } from './balance';
import { AllowanceAPI } from './allowance';
import { WalletConnect, WalletConnectOptions } from './wallet-connect';
import { sample } from 'lodash';
import { ContractDataInWebWorkerAPI } from './contract-data/contract-data-webworker';
import { createFactoryWithCacheByChain } from '../utils/factory-utils';
import { ContractDataAPI } from './contract-data/contract-data';
import { ContractDataMcV2API } from './contract-data/contract-data-multicallv2';
import { ChainEntity } from '../entities/chain';
import { IContractDataApi } from './contract-data/contract-data-types';
import { featureFlag_getContractDataApiImplem } from '../utils/feature-flags';
// @ts-ignore
// eslint-disable-next-line
import ContractDataWorker from 'worker-loader!./contract-data/worker/contract-data.webworker.ts';

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

let webWorker1 = null;
let webWorker2 = null;
if (featureFlag_getContractDataApiImplem() === 'webworker-eth-multicall') {
  webWorker1 = Comlink.wrap(new ContractDataWorker()) as Comlink.Remote<Worker>;
  webWorker2 = Comlink.wrap(new ContractDataWorker()) as Comlink.Remote<Worker>;
}
export const getContractDataApi = createFactoryWithCacheByChain((chain): IContractDataApi => {
  const web3 = getWeb3Instance(chain);

  if (featureFlag_getContractDataApiImplem() === 'eth-multicall') {
    console.debug(`Instanciating ContractDataAPI for chain ${chain.id}`);
    return new ContractDataAPI(web3, chain);
  } else if (
    featureFlag_getContractDataApiImplem() === 'new-multicall' &&
    chain.fetchContractDataAddress
  ) {
    if (chain.fetchContractDataAddress) {
      console.debug(`Instanciating ContractDataMcV2API for chain ${chain.id}`);
      return new ContractDataMcV2API(
        web3,
        chain as ChainEntity & { fetchContractDataAddress: string }
      );
    } else {
      console.debug(
        `Couldn't find chain.fetchContractDataAddress, Instanciating ContractDataAPI for chain ${chain.id}`
      );
      return new ContractDataAPI(web3, chain);
    }
  } else if (featureFlag_getContractDataApiImplem() === 'webworker-eth-multicall') {
    console.debug(`Instanciating ContractDataInWebWorkerAPI for chain ${chain.id}`);

    // bsc has many data, gets his own worker
    if (chain.id === 'bsc') {
      return new ContractDataInWebWorkerAPI(chain, webWorker2);
    } else {
      return new ContractDataInWebWorkerAPI(chain, webWorker1);
    }
  }
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
