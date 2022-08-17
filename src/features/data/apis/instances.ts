import { BeefyAPI } from './beefy';
import { ConfigAPI } from './config';
import { sample } from 'lodash';
import { createFactoryWithCacheByChain } from '../utils/factory-utils';
import { ChainEntity } from '../entities/chain';
import { IWalletConnectionApi, WalletConnectionOptions } from './wallet/wallet-connection-types';
import { BridgeApi } from './bridge/bridge';
import { IOnRampApi } from './on-ramp/on-ramp-types';

// todo: maybe don't instanciate here, idk yet
const beefyApi = new BeefyAPI();
const configApi = new ConfigAPI();
const bridgeApi = new BridgeApi();

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

export function getBridgeApi(): BridgeApi {
  return bridgeApi;
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
  const { ContractDataAPI } = await ContractDataAPIPromise;

  const web3 = await getWeb3Instance(chain);

  console.debug(`Instanciating ContractDataAPI for chain ${chain.id}`);
  return new ContractDataAPI(web3, chain as ChainEntity & { fetchContractDataAddress: string });
});

const BalanceAPIPromise = import('./balance');
export const getBalanceApi = createFactoryWithCacheByChain(async chain => {
  const { BalanceAPI } = await BalanceAPIPromise;

  const web3 = await getWeb3Instance(chain);

  console.debug(`Instanciating BalanceAPI for chain ${chain.id}`);
  return new BalanceAPI(web3, chain as ChainEntity & { fetchBalancesAddress: string });
});

const AllowanceAPIPromise = import('./allowance');
export const getAllowanceApi = createFactoryWithCacheByChain(async chain => {
  const { AllowanceAPI } = await AllowanceAPIPromise;

  const web3 = await getWeb3Instance(chain);

  console.debug(`Instanciating AllowanceAPI for chain ${chain.id}`);
  return new AllowanceAPI(web3, chain as ChainEntity & { fetchBalancesAddress: string });
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

const MintersAPIPromise = import('./minter/minter');
export const getMintersApi = createFactoryWithCacheByChain(async chain => {
  const { MinterApi } = await MintersAPIPromise;
  const web3 = await getWeb3Instance(chain);
  console.debug(`Instanciating MinterAPI for chain ${chain.id}`);
  return new MinterApi(web3, chain);
});

let onRampApiInstance: IOnRampApi | null = null;

export async function getOnRampApi(): Promise<IOnRampApi> {
  if (onRampApiInstance) {
    return onRampApiInstance;
  }

  const { OnRampApi } = await import('./on-ramp/on-ramp');
  onRampApiInstance = new OnRampApi();
  return onRampApiInstance;
}
