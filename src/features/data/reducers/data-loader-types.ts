import type { ChainEntity, ChainId } from '../entities/chain.ts';

/**
 * because we want to be smart about data loading
 * I think we need a dedicated "loading" slice
 * where we can ask which data is loading and which data is loaded
 * this will simplify other slices as they can focus on data
 * and this slice can focus on data fetching
 * maybe it's dumb though, but it can be refactored
 **/

export type LastStatus = {
  timestamp: number;
  requestId: string;
};

export interface LoaderStateIdle {
  lastDispatched: undefined;
  lastFulfilled: undefined;
  lastRejected: undefined;
  status: 'idle';
  error: null;
}

export interface LoaderStatePending {
  lastDispatched: LastStatus;
  lastFulfilled: LastStatus | undefined;
  lastRejected: LastStatus | undefined;
  status: 'pending';
  error: null;
}

export interface LoaderStateRejected {
  lastDispatched: LastStatus;
  lastFulfilled: LastStatus | undefined;
  lastRejected: LastStatus;
  status: 'rejected';
  error: string;
}

export interface LoaderStateFulfilled {
  lastDispatched: LastStatus;
  lastFulfilled: LastStatus;
  lastRejected: LastStatus | undefined;
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
    excludeChainIds: ChainId[];
    notifications: {
      common: LoaderNotification[];
      byAddress: Record<string, LoaderNotification[]>;
    };
    ignored: {
      common: LoaderNotificationKey[];
      byAddress: Record<string, LoaderNotificationKey[]>;
    };
  };
  global: {
    addressBook: LoaderState;
    analytics: LoaderState;
    apy: LoaderState;
    articles: LoaderState;
    avgApy: LoaderState;
    boostForm: LoaderState;
    bridgeConfig: LoaderState;
    bridges: LoaderState;
    chainConfig: LoaderState;
    curators: LoaderState;
    currentCowcentratedRanges: LoaderState;
    fees: LoaderState;
    lastHarvests: LoaderState;
    merklCampaigns: LoaderState;
    merklRewards: LoaderState;
    minterForm: LoaderState;
    minters: LoaderState;
    platforms: LoaderState;
    prices: LoaderState;
    proposals: LoaderState;
    promos: LoaderState;
    stellaSwapRewards: LoaderState;
    treasury: LoaderState;
    vaults: LoaderState;
    wallet: LoaderState;
    zapAggregatorTokenSupport: LoaderState;
    zapAmms: LoaderState;
    zapConfigs: LoaderState;
    zapSwapAggregators: LoaderState;
    revenue: LoaderState;
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

export type LoaderNotificationCategory = 'rpc' | 'api' | 'config';

export type LoaderKeys = {
  global?: (keyof DataLoaderState['global'])[];
  chain?: (keyof ByChainDataEntity)[];
  addressGlobal?: (keyof ByAddressGlobalDataEntity)[];
  addressChain?: (keyof ByAddressByChainDataEntity)[];
};

export type LoaderNotificationCategoryMap = Record<LoaderNotificationCategory, LoaderKeys>;

export type LoaderNotificationKey =
  | LoaderNotificationCategory
  | `${LoaderNotificationCategory}-${ChainId}`;

export type LoaderNotification = {
  key: LoaderNotificationKey;
  category: LoaderNotificationCategory;
  chainId?: ChainId | undefined;
};
