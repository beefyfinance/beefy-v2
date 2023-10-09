import { BeefyAPI } from './beefy/beefy-api';
import { ConfigAPI } from './config';
import { sample } from 'lodash-es';
import { createFactoryWithCacheByChain } from '../utils/factory-utils';
import type { ChainEntity } from '../entities/chain';
import type {
  IWalletConnectionApi,
  WalletConnectionOptions,
} from './wallet/wallet-connection-types';
import { BridgeApi } from './bridge/bridge';
import type { IOnRampApi } from './on-ramp/on-ramp-types';
import type { ITransactApi } from './transact/transact-types';
import { createWeb3Instance, rateLimitWeb3Instance } from '../../../helpers/web3';
import { createGasPricer } from './gas-prices';
import { AnalyticsApi } from './analytics/analytics';
import type { IOneInchApi } from './one-inch/one-inch-types';
import type { IBeefyDataApi } from './beefy/beefy-data-api-types';
import PQueue from 'p-queue';

import type { IMigrationApi } from './migration/migration-types';
import type { ISnapshotBalanceApi } from './snapshot-balance/snapshot-balance-types';

// todo: maybe don't instanciate here, idk yet
const beefyApi = new BeefyAPI();
const configApi = new ConfigAPI();
const bridgeApi = new BridgeApi();
const analyticsApi = new AnalyticsApi();

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

export function getAnalyticsApi(): AnalyticsApi {
  return analyticsApi;
}

export const getWeb3Instance = createFactoryWithCacheByChain(async chain => {
  // pick one RPC endpoint at random
  const rpc = sample(chain.rpc);
  const requestsPerSecond = 10; // may need to be configurable per rpc [ankr allows ~30 rps]
  const queue = new PQueue({
    concurrency: requestsPerSecond,
    intervalCap: requestsPerSecond,
    interval: 1000,
    carryoverConcurrencyCount: true,
    autoStart: true,
  });

  console.debug(`Instantiating rate-limited Web3 for chain ${chain.id} via ${rpc}`);
  return rateLimitWeb3Instance(createWeb3Instance(rpc), queue);
});

export const getGasPricer = createFactoryWithCacheByChain(async chain => {
  return createGasPricer(chain);
});

const ContractDataAPIPromise = import('./contract-data');
export const getContractDataApi = createFactoryWithCacheByChain(async chain => {
  const { ContractDataAPI } = await ContractDataAPIPromise;

  const web3 = await getWeb3Instance(chain);

  console.debug(`Instanciating ContractDataAPI for chain ${chain.id}`);
  return new ContractDataAPI(web3, chain as ChainEntity);
});

const BalanceAPIPromise = import('./balance');
export const getBalanceApi = createFactoryWithCacheByChain(async chain => {
  const { BalanceAPI } = await BalanceAPIPromise;

  const web3 = await getWeb3Instance(chain);

  console.debug(`Instanciating BalanceAPI for chain ${chain.id}`);
  return new BalanceAPI(web3, chain as ChainEntity);
});

const AllowanceAPIPromise = import('./allowance');
export const getAllowanceApi = createFactoryWithCacheByChain(async chain => {
  const { AllowanceAPI } = await AllowanceAPIPromise;

  const web3 = await getWeb3Instance(chain);

  console.debug(`Instanciating AllowanceAPI for chain ${chain.id}`);
  return new AllowanceAPI(web3, chain as ChainEntity);
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

let transactApiInstance: ITransactApi | null = null;

export async function getTransactApi(): Promise<ITransactApi> {
  if (transactApiInstance) {
    return transactApiInstance;
  }

  const { TransactApi } = await import('./transact/transact');
  transactApiInstance = new TransactApi();
  return transactApiInstance;
}

const OneInchApiPromise = import('./one-inch');
const oneInchApiCache: { [chainId: string]: IOneInchApi } = {};
export async function getOneInchApi(
  chain: ChainEntity,
  oracleAddress: string
): Promise<IOneInchApi> {
  if (!oneInchApiCache[chain.id]) {
    const { OneInchApi } = await OneInchApiPromise;
    console.debug(`Instanciating OneInchApi for chain ${chain.id}`);
    oneInchApiCache[chain.id] = new OneInchApi(chain, oracleAddress);
  }

  return oneInchApiCache[chain.id];
}

let beefyDataApiInstance: IBeefyDataApi | null = null;

export async function getBeefyDataApi(): Promise<IBeefyDataApi> {
  if (beefyDataApiInstance) {
    return beefyDataApiInstance;
  }

  const { BeefyDataApi } = await import('./beefy/beefy-data-api');
  beefyDataApiInstance = new BeefyDataApi();
  return beefyDataApiInstance;
}

let migrationApiInstance: IMigrationApi | null = null;
export async function getMigrationApi(): Promise<IMigrationApi> {
  if (migrationApiInstance) {
    return migrationApiInstance;
  }

  const { MigrationApi } = await import('./migration');
  migrationApiInstance = new MigrationApi();
  return migrationApiInstance;
}

let snapshotBalanceApiInstance: ISnapshotBalanceApi | null = null;
export async function getSnapshotBalanceApi(): Promise<ISnapshotBalanceApi> {
  if (snapshotBalanceApiInstance) {
    return snapshotBalanceApiInstance;
  }
  const { SnapshotBalanceApi } = await import('./snapshot-balance/snapshot-balance');

  snapshotBalanceApiInstance = new SnapshotBalanceApi();
  return snapshotBalanceApiInstance;
}
