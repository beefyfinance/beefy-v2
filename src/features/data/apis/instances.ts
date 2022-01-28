import { BeefyAPI } from './beefy';
import { ConfigAPI } from './config';
import Web3 from 'web3';
import { BalanceAPI } from './balance';
import { AllowanceAPI } from './allowance';
import { WalletConnect, WalletConnectOptions } from './wallet-connect';
import { sample } from 'lodash';
import { ContractDataAPIV2 } from './contract-data/contract-data-v2';
import { createFactoryWithCacheByChain } from '../utils/factory-utils';

import * as Comlink from 'comlink';

// @ts-ignore
// eslint-disable-next-line
import ContractDataWorker from 'worker-loader!./contract-data/worker/contract-data-v2.webworker.ts';
import { ContractDataAPI } from './contract-data/contract-data';

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
/*
const worker1 = Comlink.wrap(new ContractDataWorker()) as Comlink.Remote<Worker>;
const worker2 = Comlink.wrap(new ContractDataWorker()) as Comlink.Remote<Worker>;

export const getContractDataApi = createFactoryWithCacheByChain(chain => {
  console.debug(`Instanciating ContractDataAPIV2 for chain ${chain.id}`);

  // bsc has many data, gets his own worker
  if (chain.id === 'bsc') {
    return new ContractDataAPIV2(chain, worker2);
  } else {
    return new ContractDataAPIV2(chain, worker1);
  }
});*/
export const getContractDataApi = createFactoryWithCacheByChain(chain => {
  const web3 = getWeb3Instance(chain);
  console.debug(`Instanciating ContractDataAPI for chain ${chain.id}`);

  // bsc has many data, gets his own worker
  return new ContractDataAPI(web3, chain);
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
