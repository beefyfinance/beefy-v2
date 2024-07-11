import type { ChainEntity, ChainId } from '../entities/chain';

/**
 * because we want to be smart about data loading
 * I think we need a dedicated "loading" slice
 * where we can ask which data is loading and which data is loaded
 * this will simplify other slices as they can focus on data
 * and this slice can focus on data fetching
 * maybe it's dumb though, but it can be refactored
 **/
export interface LoaderStateIdle {
  lastDispatched: undefined;
  lastFulfilled: undefined;
  lastRejected: undefined;
  status: 'idle';
  error: null;
}

export interface LoaderStatePending {
  lastDispatched: number;
  lastFulfilled: number | undefined;
  lastRejected: number | undefined;
  status: 'pending';
  error: null;
}

export interface LoaderStateRejected {
  lastDispatched: number;
  lastFulfilled: number | undefined;
  lastRejected: number;
  status: 'rejected';
  error: string;
}

export interface LoaderStateFulfilled {
  lastDispatched: number;
  lastFulfilled: number;
  lastRejected: number | undefined;
  status: 'fulfilled';
  error: null;
}

export type LoaderState =
  | LoaderStateIdle
  | LoaderStatePending
  | LoaderStateRejected
  | LoaderStateFulfilled;

export interface DataLoaderState {
  instances: {
    wallet: boolean;
  };
  statusIndicator: {
    open: boolean;
    excludeChainIds: ChainId[];
  };
  global: {
    chainConfig: LoaderState;
    prices: LoaderState;
    apy: LoaderState;
    vaults: LoaderState;
    lastHarvests: LoaderState;
    fees: LoaderState;
    boosts: LoaderState;
    wallet: LoaderState;
    zapAmms: LoaderState;
    zapConfigs: LoaderState;
    zapSwapAggregators: LoaderState;
    zapAggregatorTokenSupport: LoaderState;
    depositForm: LoaderState;
    withdrawForm: LoaderState;
    boostForm: LoaderState;
    addressBook: LoaderState;
    minters: LoaderState;
    minterForm: LoaderState;
    bridgeConfig: LoaderState;
    platforms: LoaderState;
    onRamp: LoaderState;
    treasury: LoaderState;
    analytics: LoaderState;
    proposals: LoaderState;
    bridges: LoaderState;
    migrators: LoaderState;
    articles: LoaderState;
    merklCampaigns: LoaderState;
    currentCowcentratedRanges: LoaderState;
    merklRewards: LoaderState;
  };
  byChainId: {
    [chainId in ChainEntity['id']]?: ChainIdDataEntity;
  };
  byAddress: {
    [address: string]: {
      global: GlobalDataByAddressEntity;
      byChainId: {
        [chainId in ChainEntity['id']]?: ChainIdDataByAddressByChainEntity;
      };
    };
  };
}

export interface ChainIdDataEntity {
  contractData: LoaderState;
  addressBook: LoaderState;
}

export interface ChainIdDataByAddressByChainEntity {
  balance: LoaderState;
  allowance: LoaderState;
  clmHarvests: LoaderState;
}

export interface GlobalDataByAddressEntity {
  timeline: LoaderState;
  depositedVaults: LoaderState;
  dashboard: LoaderState;
  clmHarvests: LoaderState;
  merklRewards: LoaderState;
}

export type LoaderGlobalKey = keyof DataLoaderState['global'];
export type LoaderChainKey = keyof ChainIdDataEntity;
export type LoaderChainAddressKey = keyof ChainIdDataByAddressByChainEntity;
export type LoaderAddressKey = keyof GlobalDataByAddressEntity;
