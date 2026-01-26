import type {
  ActionReducerMapBuilder,
  AsyncThunk,
  PayloadAction,
  SerializedError,
} from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import { cloneDeep } from 'lodash-es';
import { errorToString } from '../../../helpers/format.ts';
import { fetchAllAllowanceAction } from '../actions/allowance.ts';
import {
  fetchClmHarvestsForUser,
  fetchClmHarvestsForVaultsOfUserOnChain,
  fetchWalletTimeline,
  initDashboardByAddress,
} from '../actions/analytics.ts';
import { fetchApyAction, fetchAvgApyAction } from '../actions/apy.ts';
import { fetchLastArticle } from '../actions/articles.ts';
import { fetchAllBalanceAction, recalculateDepositedVaultsAction } from '../actions/balance.ts';
import { initiateBoostForm } from '../actions/boosts.ts';
import { fetchBridgeConfig } from '../actions/bridge.ts';
import { fetchBridges } from '../actions/bridges.ts';
import { initCampaignBeGems } from '../actions/campaigns/begems.ts';
import { fetchChainConfigs } from '../actions/chains.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import { fetchCurators } from '../actions/curators.ts';
import { fetchFees } from '../actions/fees.ts';
import { fetchAllMinters, initiateMinterForm } from '../actions/minters.ts';
import { fetchPlatforms } from '../actions/platforms.ts';
import { fetchAllPricesAction } from '../actions/prices.ts';
import { initPromos } from '../actions/promos.ts';
import { fetchActiveProposals } from '../actions/proposal.ts';
import { fetchOffChainCampaignsAction } from '../actions/rewards.ts';
import {
  fetchAddressBookAction,
  fetchAllAddressBookAction,
  fetchAllCurrentCowcentratedRanges,
  reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
} from '../actions/tokens.ts';
import { fetchTreasury } from '../actions/treasury.ts';
import { fetchUserMerklRewardsAction } from '../actions/user-rewards/merkl-user-rewards.ts';
import { fetchUserStellaSwapRewardsAction } from '../actions/user-rewards/stellaswap-user-rewards.ts';
import { fetchAllVaults, fetchVaultsLastHarvests } from '../actions/vaults.ts';
import { initWallet } from '../actions/wallet.ts';
import {
  fetchZapAggregatorTokenSupportAction,
  fetchZapAmmsAction,
  fetchZapConfigsAction,
  fetchZapSwapAggregatorsAction,
} from '../actions/zap.ts';
import type { ChainEntity, ChainId } from '../entities/chain.ts';
import type {
  ByAddressByChainDataEntity,
  ByChainDataEntity,
  DataLoaderState,
  LoaderAddressChainKey,
  LoaderAddressKey,
  LoaderChainKey,
  LoaderGlobalKey,
  LoaderState,
  LoaderStateFulfilled,
  LoaderStateIdle,
  LoaderStatePending,
  LoaderStateRejected,
} from './data-loader-types.ts';
import { fetchWeeklyRevenueStats } from '../actions/revenue.ts';
import { getNotifications } from './data-loader-notifications.ts';

const dataLoaderStateInit: LoaderStateIdle = {
  lastFulfilled: undefined,
  lastDispatched: undefined,
  lastRejected: undefined,
  status: 'idle',
  error: null,
};

const dataLoaderStateInitByChainId: ByChainDataEntity = {
  contractData: dataLoaderStateInit,
  addressBook: dataLoaderStateInit,
};

const dataLoaderStateInitByAddress: DataLoaderState['byAddress'][string] = {
  byChainId: {},
  // byVaultId: {},
  global: {
    timeline: dataLoaderStateInit,
    depositedVaults: dataLoaderStateInit,
    dashboard: dataLoaderStateInit,
    clmHarvests: dataLoaderStateInit,
    merklRewards: dataLoaderStateInit,
    stellaSwapRewards: dataLoaderStateInit,
  },
};

const dataLoaderStateInitByAddressByChainId: ByAddressByChainDataEntity = {
  balance: dataLoaderStateInit,
  allowance: dataLoaderStateInit,
  clmHarvests: dataLoaderStateInit,
};

// const dataLoaderStateInitByAddressByVaultId: ByAddressByVaultDataEntity = {};

export const initialDataLoaderState: DataLoaderState = {
  instances: {
    wallet: false,
  },
  statusIndicator: {
    excludeChainIds: [],
    notifications: {
      common: [],
      byAddress: {},
    },
    ignored: {
      common: [],
      byAddress: {},
    },
  },
  global: {
    addressBook: dataLoaderStateInit,
    analytics: dataLoaderStateInit,
    apy: dataLoaderStateInit,
    articles: dataLoaderStateInit,
    avgApy: dataLoaderStateInit,
    beGemsCampaign: dataLoaderStateInit,
    boostForm: dataLoaderStateInit,
    bridgeConfig: dataLoaderStateInit,
    bridges: dataLoaderStateInit,
    chainConfig: dataLoaderStateInit,
    curators: dataLoaderStateInit,
    currentCowcentratedRanges: dataLoaderStateInit,
    fees: dataLoaderStateInit,
    lastHarvests: dataLoaderStateInit,
    merklCampaigns: dataLoaderStateInit,
    merklRewards: dataLoaderStateInit,
    minterForm: dataLoaderStateInit,
    minters: dataLoaderStateInit,
    platforms: dataLoaderStateInit,
    prices: dataLoaderStateInit,
    promos: dataLoaderStateInit,
    proposals: dataLoaderStateInit,
    stellaSwapRewards: dataLoaderStateInit,
    treasury: dataLoaderStateInit,
    vaults: dataLoaderStateInit,
    wallet: dataLoaderStateInit,
    zapAggregatorTokenSupport: dataLoaderStateInit,
    zapAmms: dataLoaderStateInit,
    zapConfigs: dataLoaderStateInit,
    zapSwapAggregators: dataLoaderStateInit,
    revenue: dataLoaderStateInit,
  },
  byChainId: {},
  byAddress: {},
};

function makePendingState(
  existing: LoaderState | undefined,
  requestId: string
): LoaderStatePending {
  return {
    lastDispatched: { timestamp: Date.now(), requestId },
    lastFulfilled: existing?.lastFulfilled || undefined,
    lastRejected: existing?.lastRejected || undefined,
    status: 'pending',
    error: null,
  };
}

function makeRejectedState(
  existing: LoaderState | undefined,
  requestId: string,
  error: string
): LoaderStateRejected {
  return {
    lastDispatched: existing?.lastDispatched || { timestamp: Date.now(), requestId },
    lastFulfilled: existing?.lastFulfilled || undefined,
    lastRejected: { timestamp: Date.now(), requestId },
    status: 'rejected',
    error,
  };
}

function makeFulfilledState(
  existing: LoaderState | undefined,
  requestId: string
): LoaderStateFulfilled {
  return {
    lastDispatched: existing?.lastDispatched || { timestamp: Date.now(), requestId },
    lastFulfilled: { timestamp: Date.now(), requestId },
    lastRejected: existing?.lastRejected || undefined,
    status: 'fulfilled',
    error: null,
  };
}

function recalculateNotifications(sliceState: Draft<DataLoaderState>, walletAddress?: string) {
  const { common, user } = getNotifications(sliceState, walletAddress);
  sliceState.statusIndicator.notifications.common = common;
  if (common.length === 0) {
    // clear ignored if there are currently no errors
    sliceState.statusIndicator.ignored.common = [];
  }

  if (walletAddress && user) {
    const addressKey = walletAddress.toLowerCase();
    sliceState.statusIndicator.notifications.byAddress[addressKey] = user;
    if (user.length === 0) {
      // clear ignored if there are currently no errors
      sliceState.statusIndicator.ignored.byAddress[addressKey] = [];
    }
  }
}

/**
 * Handling those async actions is very generic
 * Use a helper function to handle each action state
 */
function addGlobalAsyncThunkActions<TPayload, TArg>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<
    TPayload,
    TArg,
    {
      state: unknown;
    }
  >,
  stateKey: LoaderGlobalKey
) {
  builder.addCase(action.pending, (sliceState, action) => {
    setGlobalPending(sliceState, stateKey, action.meta.requestId);
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    setGlobalRejected(sliceState, stateKey, action.meta.requestId, action.error);
    recalculateNotifications(sliceState);
  });
  builder.addCase(action.fulfilled, (sliceState, action) => {
    if (fetchChainConfigs.fulfilled.match(action)) {
      sliceState.statusIndicator.excludeChainIds = action.payload.chainConfigs
        .filter(c => c.eol)
        .map(c => c.id);
    }
    setGlobalFulfilled(sliceState, stateKey, action.meta.requestId);
    recalculateNotifications(sliceState);
  });
}

function setGlobalPending(
  sliceState: Draft<DataLoaderState>,
  stateKey: LoaderGlobalKey,
  requestId: string
) {
  sliceState.global[stateKey] = makePendingState(sliceState.global[stateKey], requestId);
}

function setGlobalRejected(
  sliceState: Draft<DataLoaderState>,
  stateKey: LoaderGlobalKey,
  requestId: string,
  error: SerializedError | string | undefined | null
) {
  sliceState.global[stateKey] = makeRejectedState(
    sliceState.global[stateKey],
    requestId,
    errorToString(error)
  );
}

function setGlobalFulfilled(
  sliceState: Draft<DataLoaderState>,
  stateKey: LoaderGlobalKey,
  requestId: string
) {
  sliceState.global[stateKey] = makeFulfilledState(sliceState.global[stateKey], requestId);
}

function getOrCreateChainState(sliceState: Draft<DataLoaderState>, chainId: ChainId) {
  let chainState: ByChainDataEntity | undefined = sliceState.byChainId[chainId];
  if (!chainState) {
    chainState = cloneDeep(dataLoaderStateInitByChainId);
    sliceState.byChainId = {
      ...sliceState.byChainId,
      [chainId]: chainState,
    };
  }
  return chainState;
}

function getOrCreateAddressState(sliceState: Draft<DataLoaderState>, address: string) {
  const addressKey = address.toLowerCase();
  let addressState = sliceState.byAddress[addressKey];
  if (!addressState) {
    addressState = cloneDeep(dataLoaderStateInitByAddress);
    sliceState.byAddress = {
      ...sliceState.byAddress,
      [addressKey]: addressState,
    };
  }

  return addressState;
}

function getOrCreateAddressChainState(
  sliceState: Draft<DataLoaderState>,
  chainId: ChainId,
  address: string
) {
  const addressKey = address.toLowerCase();
  const addressState = getOrCreateAddressState(sliceState, addressKey);

  let chainState: ByAddressByChainDataEntity | undefined = addressState.byChainId[chainId];
  if (!chainState) {
    chainState = cloneDeep(dataLoaderStateInitByAddressByChainId);
    sliceState.byAddress[addressKey].byChainId = {
      ...sliceState.byAddress[addressKey].byChainId,
      [chainId]: chainState,
    };
  }

  return chainState;
}

/*function getOrCreateAddressVaultState(
  sliceState: Draft<DataLoaderState>,
  vaultId: string,
  address: string
) {
  const addressKey = address.toLowerCase();
  const addressState = getOrCreateAddressState(sliceState, addressKey);

  let vaultState: ByAddressByVaultDataEntity | undefined = addressState.byVaultId[vaultId];
  if (!vaultState) {
    vaultState = cloneDeep(dataLoaderStateInitByAddressByVaultId);
    sliceState.byAddress[addressKey].byVaultId = {
      ...sliceState.byAddress[addressKey].byVaultId,
      [vaultId]: vaultState,
    };
  }

  return vaultState;
}*/

function addByChainAsyncThunkActions<
  TPayload,
  TArg extends {
    chainId: ChainEntity['id'];
  },
>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<
    TPayload,
    TArg,
    {
      state: unknown;
    }
  >,
  stateKeys: Array<LoaderChainKey>
) {
  builder
    .addCase(action.pending, (sliceState, action) => {
      const chainId = action.meta.arg.chainId;
      const chainState = getOrCreateChainState(sliceState, chainId);
      for (const stateKey of stateKeys) {
        chainState[stateKey] = makePendingState(chainState[stateKey], action.meta.requestId);
      }
    })
    .addCase(action.rejected, (sliceState, action) => {
      const chainId = action.meta.arg.chainId;
      const chainState = getOrCreateChainState(sliceState, chainId);
      const error = errorToString(action.error);

      for (const stateKey of stateKeys) {
        chainState[stateKey] = makeRejectedState(
          chainState[stateKey],
          action.meta.requestId,
          error
        );
      }

      recalculateNotifications(sliceState);
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const chainId = action.meta.arg.chainId;
      const chainState = getOrCreateChainState(sliceState, chainId);

      for (const stateKey of stateKeys) {
        chainState[stateKey] = makeFulfilledState(chainState[stateKey], action.meta.requestId);
      }

      recalculateNotifications(sliceState);
    });
}

function addByAddressByChainAsyncThunkActions<
  TPayload,
  TArg extends {
    chainId: ChainEntity['id'];
    walletAddress: string;
  },
>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<
    TPayload,
    TArg,
    {
      state: unknown;
    }
  >,
  stateKeys: Array<LoaderAddressChainKey>
) {
  builder
    .addCase(action.pending, (sliceState, action) => {
      const chainId = action.meta.arg.chainId;
      const chainState = getOrCreateAddressChainState(
        sliceState,
        chainId,
        action.meta.arg.walletAddress
      );

      for (const stateKey of stateKeys) {
        chainState[stateKey] = makePendingState(chainState[stateKey], action.meta.requestId);
      }
    })
    .addCase(action.rejected, (sliceState, action) => {
      const chainId = action.meta.arg.chainId;
      const chainState = getOrCreateAddressChainState(
        sliceState,
        chainId,
        action.meta.arg.walletAddress
      );
      const error = errorToString(action.error);

      for (const stateKey of stateKeys) {
        chainState[stateKey] = makeRejectedState(
          chainState[stateKey],
          action.meta.requestId,
          error
        );
      }

      recalculateNotifications(sliceState, action.meta.arg.walletAddress);
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const chainId = action.meta?.arg.chainId;
      const chainState = getOrCreateAddressChainState(
        sliceState,
        chainId,
        action.meta.arg.walletAddress
      );

      for (const stateKey of stateKeys) {
        chainState[stateKey] = makeFulfilledState(chainState[stateKey], action.meta.requestId);
      }

      recalculateNotifications(sliceState, action.meta.arg.walletAddress);
    });
}

/*function addByAddressByVaultAsyncThunkActions<
  ActionParams extends { vaultId: VaultEntity['id']; walletAddress: string }
>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, ActionParams, { state: unknown }>,
  stateKeys: Array<LoaderAddressVaultKey>
) {
  builder
    .addCase(action.pending, (sliceState, action) => {
      const vaultId = action.meta.arg.vaultId;
      const vaultState = getOrCreateAddressVaultState(
        sliceState,
        vaultId,
        action.meta.arg.walletAddress
      );

      for (const stateKey of stateKeys) {
        vaultState[stateKey] = makePendingState(vaultState[stateKey]);
      }
    })
    .addCase(action.rejected, (sliceState, action) => {
      const vaultId = action.meta?.arg.vaultId;
      const vaultState = getOrCreateAddressVaultState(
        sliceState,
        vaultId,
        action.meta.arg.walletAddress
      );
      const error = errorToString(action.error);

      for (const stateKey of stateKeys) {
        vaultState[stateKey] = makeRejectedState(vaultState[stateKey], error);
      }
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const vaultId = action.meta?.arg.vaultId;
      const vaultState = getOrCreateAddressVaultState(
        sliceState,
        vaultId,
        action.meta.arg.walletAddress
      );

      for (const stateKey of stateKeys) {
        vaultState[stateKey] = makeFulfilledState(vaultState[stateKey]);
      }
    });
}*/

function addByAddressAsyncThunkActions<
  TPayload,
  TArg extends {
    walletAddress: string;
  },
>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<
    TPayload,
    TArg,
    {
      state: unknown;
    }
  >,
  addressKeys: Array<LoaderAddressKey>,
  globalKeys?: Array<LoaderGlobalKey>
) {
  builder
    .addCase(action.pending, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);

      for (const addressKey of addressKeys) {
        addressState.global[addressKey] = makePendingState(
          addressState.global[addressKey],
          action.meta.requestId
        );
      }

      globalKeys?.forEach(globalKey =>
        setGlobalPending(sliceState, globalKey, action.meta.requestId)
      );
    })
    .addCase(action.rejected, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);
      const error = errorToString(action.error);

      for (const addressKey of addressKeys) {
        addressState.global[addressKey] = makeRejectedState(
          addressState.global[addressKey],
          action.meta.requestId,
          error
        );
      }

      globalKeys?.forEach(globalKey =>
        setGlobalRejected(sliceState, globalKey, action.meta.requestId, action.error)
      );

      recalculateNotifications(sliceState, action.meta.arg.walletAddress);
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);

      for (const addressKey of addressKeys) {
        addressState.global[addressKey] = makeFulfilledState(
          addressState.global[addressKey],
          action.meta.requestId
        );
      }

      globalKeys?.forEach(globalKey =>
        setGlobalFulfilled(sliceState, globalKey, action.meta.requestId)
      );

      recalculateNotifications(sliceState, action.meta.arg.walletAddress);
    });
}

export const dataLoaderSlice = createSlice({
  name: 'dataLoader',
  initialState: initialDataLoaderState,
  reducers: {
    dismissNotification(sliceState, action: PayloadAction<{ walletAddress?: string }>) {
      sliceState.statusIndicator.ignored.common =
        sliceState.statusIndicator.notifications.common.map(n => n.key);
      const walletAddress = action.payload.walletAddress?.toLowerCase();
      if (walletAddress) {
        sliceState.statusIndicator.ignored.byAddress[walletAddress] =
          sliceState.statusIndicator.notifications.byAddress[walletAddress]?.map(n => n.key) || [];
      }
    },
  },
  extraReducers: builder => {
    addGlobalAsyncThunkActions(builder, fetchChainConfigs, 'chainConfig');
    addGlobalAsyncThunkActions(builder, initWallet, 'wallet');
    addGlobalAsyncThunkActions(builder, fetchAllPricesAction, 'prices');
    addGlobalAsyncThunkActions(builder, fetchApyAction, 'apy');
    addGlobalAsyncThunkActions(builder, fetchAvgApyAction, 'avgApy');
    addGlobalAsyncThunkActions(builder, fetchAllVaults, 'vaults');
    addGlobalAsyncThunkActions(builder, fetchVaultsLastHarvests, 'lastHarvests');
    addGlobalAsyncThunkActions(builder, initPromos, 'promos');
    addGlobalAsyncThunkActions(builder, fetchFees, 'fees');
    addGlobalAsyncThunkActions(builder, fetchAllMinters, 'minters');
    addGlobalAsyncThunkActions(builder, initiateBoostForm, 'boostForm');
    addGlobalAsyncThunkActions(builder, initiateMinterForm, 'minterForm');
    addGlobalAsyncThunkActions(builder, fetchBridgeConfig, 'bridgeConfig');
    addGlobalAsyncThunkActions(builder, fetchZapConfigsAction, 'zapConfigs');
    addGlobalAsyncThunkActions(builder, fetchZapSwapAggregatorsAction, 'zapSwapAggregators');
    addGlobalAsyncThunkActions(
      builder,
      fetchZapAggregatorTokenSupportAction,
      'zapAggregatorTokenSupport'
    );
    addGlobalAsyncThunkActions(builder, fetchZapAmmsAction, 'zapAmms');
    addGlobalAsyncThunkActions(builder, fetchAllAddressBookAction, 'addressBook');
    addGlobalAsyncThunkActions(builder, fetchCurators, 'curators');
    addGlobalAsyncThunkActions(builder, fetchPlatforms, 'platforms');
    addGlobalAsyncThunkActions(builder, fetchBridges, 'bridges');
    addGlobalAsyncThunkActions(builder, fetchTreasury, 'treasury');
    addGlobalAsyncThunkActions(builder, fetchActiveProposals, 'proposals');
    addGlobalAsyncThunkActions(builder, fetchLastArticle, 'articles');
    addGlobalAsyncThunkActions(builder, fetchOffChainCampaignsAction, 'merklCampaigns');
    addGlobalAsyncThunkActions(
      builder,
      fetchAllCurrentCowcentratedRanges,
      'currentCowcentratedRanges'
    );
    addGlobalAsyncThunkActions(builder, initCampaignBeGems, 'beGemsCampaign');
    addGlobalAsyncThunkActions(builder, fetchWeeklyRevenueStats, 'revenue');

    addByChainAsyncThunkActions(builder, fetchAllContractDataByChainAction, ['contractData']);
    addByChainAsyncThunkActions(builder, fetchAddressBookAction, ['addressBook']);

    addByAddressByChainAsyncThunkActions(builder, fetchAllBalanceAction, ['balance']);
    addByAddressByChainAsyncThunkActions(builder, fetchAllAllowanceAction, ['allowance']);
    addByAddressByChainAsyncThunkActions(
      builder,
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
      ['balance', 'allowance']
    );
    addByAddressByChainAsyncThunkActions(builder, fetchClmHarvestsForVaultsOfUserOnChain, [
      'clmHarvests',
    ]);

    addByAddressAsyncThunkActions(builder, fetchWalletTimeline, ['timeline'], undefined);
    addByAddressAsyncThunkActions(
      builder,
      recalculateDepositedVaultsAction,
      ['depositedVaults'],
      undefined
    );
    addByAddressAsyncThunkActions(builder, initDashboardByAddress, ['dashboard'], undefined);
    addByAddressAsyncThunkActions(builder, fetchClmHarvestsForUser, ['clmHarvests'], undefined);
    addByAddressAsyncThunkActions(
      builder,
      fetchUserStellaSwapRewardsAction,
      ['stellaSwapRewards'],
      ['stellaSwapRewards']
    );
    addByAddressAsyncThunkActions(
      builder,
      fetchUserMerklRewardsAction,
      ['merklRewards'],
      ['merklRewards']
    );
  },
});

export const dataLoaderActions = dataLoaderSlice.actions;
