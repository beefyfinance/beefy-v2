import type { ChainEntity, ChainId } from '../entities/chain.ts';

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
    addressBook: LoaderState;
    analytics: LoaderState;
    apy: LoaderState;
    articles: LoaderState;
    avgApy: LoaderState;
    beGemsCampaign: LoaderState;
    boostForm: LoaderState;
    bridgeConfig: LoaderState;
    bridges: LoaderState;
    chainConfig: LoaderState;
    currentCowcentratedRanges: LoaderState;
    depositForm: LoaderState;
    fees: LoaderState;
    lastHarvests: LoaderState;
    merklCampaigns: LoaderState;
    merklRewards: LoaderState;
    migrators: LoaderState;
    minterForm: LoaderState;
    minters: LoaderState;
    onRamp: LoaderState;
    platforms: LoaderState;
    prices: LoaderState;
    proposals: LoaderState;
    promos: LoaderState;
    stellaSwapRewards: LoaderState;
    treasury: LoaderState;
    vaults: LoaderState;
    wallet: LoaderState;
    withdrawForm: LoaderState;
    zapAggregatorTokenSupport: LoaderState;
    zapAmms: LoaderState;
    zapConfigs: LoaderState;
    zapSwapAggregators: LoaderState;
  };
  byChainId: {
    [chainId in ChainEntity['id']]?: ByChainDataEntity;
  };
  byAddress: {
    [address: string]: {
      global: ByAddressGlobalDataEntity;
      byChainId: {
        [chainId in ChainEntity['id']]?: ByAddressByChainDataEntity;
      };
    };
  };
}

export interface ByChainDataEntity {
  contractData: LoaderState;
  addressBook: LoaderState;
}

export interface ByAddressByChainDataEntity {
  balance: LoaderState;
  allowance: LoaderState;
  clmHarvests: LoaderState;
}

// export interface ByAddressByVaultDataEntity {}

export interface ByAddressGlobalDataEntity {
  timeline: LoaderState;
  depositedVaults: LoaderState;
  dashboard: LoaderState;
  clmHarvests: LoaderState;
  merklRewards: LoaderState;
  stellaSwapRewards: LoaderState;
}

export type LoaderGlobalKey = keyof DataLoaderState['global'];
export type LoaderChainKey = keyof ByChainDataEntity;
export type LoaderAddressKey = keyof ByAddressGlobalDataEntity;
export type LoaderAddressChainKey = keyof ByAddressByChainDataEntity;
// export type LoaderAddressVaultKey = keyof ByAddressByVaultDataEntity;
