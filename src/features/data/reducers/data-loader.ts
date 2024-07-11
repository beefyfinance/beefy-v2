import type { ActionReducerMapBuilder, AsyncThunk, SerializedError } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { fetchAllAllowanceAction } from '../actions/allowance';
import { fetchApyAction } from '../actions/apy';
import { fetchAllBalanceAction, recalculateDepositedVaultsAction } from '../actions/balance';
import { fetchAllBoosts, initiateBoostForm } from '../actions/boosts';
import { fetchChainConfigs } from '../actions/chains';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { fetchAllPricesAction } from '../actions/prices';
import {
  fetchAddressBookAction,
  fetchAllAddressBookAction,
  fetchAllCurrentCowcentratedRanges,
  reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
} from '../actions/tokens';
import { fetchAllVaults, fetchVaultsLastHarvests } from '../actions/vaults';
import {
  askForNetworkChange,
  askForWalletConnection,
  doDisconnectWallet,
  initWallet,
} from '../actions/wallet';
import {
  fetchZapAggregatorTokenSupportAction,
  fetchZapAmmsAction,
  fetchZapConfigsAction,
  fetchZapSwapAggregatorsAction,
} from '../actions/zap';
import { fetchAllMinters, initiateMinterForm } from '../actions/minters';
import { fetchBridgeConfig } from '../actions/bridge';
import { fetchPlatforms } from '../actions/platforms';
import { fetchOnRampSupportedProviders } from '../actions/on-ramp';
import { fetchFees } from '../actions/fees';
import type {
  ChainIdDataByAddressByChainEntity,
  ChainIdDataEntity,
  DataLoaderState,
  LoaderAddressKey,
  LoaderChainAddressKey,
  LoaderChainKey,
  LoaderGlobalKey,
  LoaderState,
  LoaderStateFulfilled,
  LoaderStateIdle,
  LoaderStatePending,
  LoaderStateRejected,
} from './data-loader-types';
import { errorToString } from '../../../helpers/format';
import { fetchTreasury } from '../actions/treasury';
import {
  fetchClmHarvestsForUser,
  fetchClmHarvestsForUserChain,
  fetchWalletTimeline,
  initDashboardByAddress,
} from '../actions/analytics';
import { fetchActiveProposals } from '../actions/proposal';
import { fetchBridges } from '../actions/bridges';
import { fetchAllMigrators } from '../actions/migrator';
import { fetchLastArticle } from '../actions/articles';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import type { Draft } from 'immer';
import { cloneDeep } from 'lodash-es';
import { fetchUserMerklRewardsAction } from '../actions/user-rewards';
import { fetchMerklCampaignsAction } from '../actions/rewards';

const dataLoaderStateInit: LoaderStateIdle = {
  lastFulfilled: undefined,
  lastDispatched: undefined,
  lastRejected: undefined,
  status: 'idle',
  error: null,
};

const dataLoaderStateInitByChainId: ChainIdDataEntity = {
  contractData: dataLoaderStateInit,
  addressBook: dataLoaderStateInit,
};

const dataLoaderStateInitByAddress: DataLoaderState['byAddress'][string] = {
  byChainId: {},
  global: {
    timeline: dataLoaderStateInit,
    depositedVaults: dataLoaderStateInit,
    dashboard: dataLoaderStateInit,
    clmHarvests: dataLoaderStateInit,
    merklRewards: dataLoaderStateInit,
  },
};

const dataLoaderStateInitByAddressByChainId: ChainIdDataByAddressByChainEntity = {
  balance: dataLoaderStateInit,
  allowance: dataLoaderStateInit,
  clmHarvests: dataLoaderStateInit,
};

export const initialDataLoaderState: DataLoaderState = {
  instances: {
    wallet: false,
  },
  statusIndicator: {
    open: false,
    excludeChainIds: [],
  },
  global: {
    chainConfig: dataLoaderStateInit,
    prices: dataLoaderStateInit,
    apy: dataLoaderStateInit,
    boosts: dataLoaderStateInit,
    vaults: dataLoaderStateInit,
    lastHarvests: dataLoaderStateInit,
    fees: dataLoaderStateInit,
    wallet: dataLoaderStateInit,
    zapAmms: dataLoaderStateInit,
    zapConfigs: dataLoaderStateInit,
    zapSwapAggregators: dataLoaderStateInit,
    zapAggregatorTokenSupport: dataLoaderStateInit,
    depositForm: dataLoaderStateInit,
    withdrawForm: dataLoaderStateInit,
    boostForm: dataLoaderStateInit,
    addressBook: dataLoaderStateInit,
    minters: dataLoaderStateInit,
    minterForm: dataLoaderStateInit,
    bridgeConfig: dataLoaderStateInit,
    platforms: dataLoaderStateInit,
    onRamp: dataLoaderStateInit,
    treasury: dataLoaderStateInit,
    analytics: dataLoaderStateInit,
    proposals: dataLoaderStateInit,
    bridges: dataLoaderStateInit,
    migrators: dataLoaderStateInit,
    articles: dataLoaderStateInit,
    merklCampaigns: dataLoaderStateInit,
    currentCowcentratedRanges: dataLoaderStateInit,
    merklRewards: dataLoaderStateInit,
  },
  byChainId: {},
  byAddress: {},
};

function makePendingState(existing: LoaderState | undefined): LoaderStatePending {
  return {
    lastDispatched: Date.now(),
    lastFulfilled: existing?.lastFulfilled || undefined,
    lastRejected: existing?.lastRejected || undefined,
    status: 'pending',
    error: null,
  };
}

function makeRejectedState(existing: LoaderState | undefined, error: string): LoaderStateRejected {
  return {
    lastDispatched: existing?.lastDispatched || Date.now(),
    lastFulfilled: existing?.lastFulfilled || undefined,
    lastRejected: Date.now(),
    status: 'rejected',
    error,
  };
}

function makeFulfilledState(existing: LoaderState | undefined): LoaderStateFulfilled {
  return {
    lastDispatched: existing?.lastDispatched || Date.now(),
    lastFulfilled: Date.now(),
    lastRejected: existing?.lastRejected || undefined,
    status: 'fulfilled',
    error: null,
  };
}

/**
 * Handling those async actions is very generic
 * Use a helper function to handle each action state
 */
function addGlobalAsyncThunkActions(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, unknown, { state: BeefyState }>,
  stateKey: LoaderGlobalKey,
  openNetworkModalOnReject: boolean = false
) {
  builder.addCase(action.pending, sliceState => {
    setGlobalPending(sliceState, stateKey);
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    setGlobalRejected(sliceState, stateKey, action.error, openNetworkModalOnReject);
  });
  builder.addCase(action.fulfilled, (sliceState, action) => {
    setGlobalFulfilled(sliceState, stateKey);
    if (fetchChainConfigs.fulfilled.match(action)) {
      sliceState.statusIndicator.excludeChainIds = action.payload.chainConfigs
        .filter(c => c.eol)
        .map(c => c.id);
    }
  });
}

function setGlobalPending(sliceState: Draft<DataLoaderState>, stateKey: LoaderGlobalKey) {
  sliceState.global[stateKey] = makePendingState(sliceState.global[stateKey]);
}

function setGlobalRejected(
  sliceState: Draft<DataLoaderState>,
  stateKey: LoaderGlobalKey,
  error: SerializedError | string | undefined | null,
  openModal?: boolean
) {
  sliceState.global[stateKey] = makeRejectedState(
    sliceState.global[stateKey],
    errorToString(error)
  );
  if (openModal) {
    sliceState.statusIndicator.open = true;
  }
}

function setGlobalFulfilled(sliceState: Draft<DataLoaderState>, stateKey: LoaderGlobalKey) {
  sliceState.global[stateKey] = makeFulfilledState(sliceState.global[stateKey]);
}

function getOrCreateChainState(sliceState: Draft<DataLoaderState>, chainId: string) {
  let chainState: ChainIdDataEntity | undefined = sliceState.byChainId[chainId];
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
  chainId: string,
  address: string
) {
  const addressKey = address.toLowerCase();
  const addressState = getOrCreateAddressState(sliceState, addressKey);

  let chainState: ChainIdDataByAddressByChainEntity | undefined = addressState.byChainId[chainId];
  if (!chainState) {
    chainState = cloneDeep(dataLoaderStateInitByAddressByChainId);
    sliceState.byAddress[addressKey].byChainId = {
      ...sliceState.byAddress[addressKey].byChainId,
      [chainId]: chainState,
    };
  }

  return chainState;
}

function addByChainAsyncThunkActions<ActionParams extends { chainId: ChainEntity['id'] }>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, ActionParams, { state: BeefyState }>,
  stateKeys: Array<LoaderChainKey>
) {
  builder
    .addCase(action.pending, (sliceState, action) => {
      const chainId = action.meta?.arg.chainId;
      const chainState = getOrCreateChainState(sliceState, chainId);
      for (const stateKey of stateKeys) {
        chainState[stateKey] = makePendingState(chainState[stateKey]);
      }
    })
    .addCase(action.rejected, (sliceState, action) => {
      const chainId = action.meta?.arg.chainId;
      const chainState = getOrCreateChainState(sliceState, chainId);
      const error = errorToString(action.error);

      for (const stateKey of stateKeys) {
        chainState[stateKey] = makeRejectedState(chainState[stateKey], error);

        // something got rejected, we want to auto-open the indicator if not eol chain
        sliceState.statusIndicator.open =
          !sliceState.statusIndicator.excludeChainIds.includes(chainId);
      }
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const chainId = action.meta?.arg.chainId;
      const chainState = getOrCreateChainState(sliceState, chainId);

      for (const stateKey of stateKeys) {
        chainState[stateKey] = makeFulfilledState(chainState[stateKey]);
      }
    });
}

function addByAddressByChainAsyncThunkActions<
  ActionParams extends { chainId: ChainEntity['id']; walletAddress: string }
>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, ActionParams, { state: BeefyState }>,
  stateKeys: Array<LoaderChainAddressKey>
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
        chainState[stateKey] = makePendingState(chainState[stateKey]);
      }
    })
    .addCase(action.rejected, (sliceState, action) => {
      const chainId = action.meta?.arg.chainId;
      const chainState = getOrCreateAddressChainState(
        sliceState,
        chainId,
        action.meta.arg.walletAddress
      );
      const error = errorToString(action.error);

      for (const stateKey of stateKeys) {
        chainState[stateKey] = makeRejectedState(chainState[stateKey], error);
      }
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const chainId = action.meta?.arg.chainId;
      const chainState = getOrCreateAddressChainState(
        sliceState,
        chainId,
        action.meta.arg.walletAddress
      );

      for (const stateKey of stateKeys) {
        chainState[stateKey] = makeFulfilledState(chainState[stateKey]);
      }
    });
}

function addByAddressAsyncThunkActions<ActionParams extends { walletAddress: string }>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, ActionParams, { state: BeefyState }>,
  addressKeys: Array<LoaderAddressKey>,
  globalKeys?: Array<LoaderGlobalKey>
) {
  builder
    .addCase(action.pending, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);

      for (const addressKey of addressKeys) {
        addressState.global[addressKey] = makePendingState(addressState.global[addressKey]);
      }

      globalKeys?.forEach(globalKey => setGlobalPending(sliceState, globalKey));
    })
    .addCase(action.rejected, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);
      const error = errorToString(action.error);

      for (const addressKey of addressKeys) {
        addressState.global[addressKey] = makeRejectedState(addressState.global[addressKey], error);
      }

      globalKeys?.forEach(globalKey => setGlobalRejected(sliceState, globalKey, action.error));
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);

      for (const addressKey of addressKeys) {
        addressState.global[addressKey] = makeFulfilledState(addressState.global[addressKey]);
      }

      globalKeys?.forEach(globalKey => setGlobalFulfilled(sliceState, globalKey));
    });
}

export const dataLoaderSlice = createSlice({
  name: 'dataLoader',
  initialState: initialDataLoaderState,
  reducers: {
    closeIndicator(sliceState) {
      sliceState.statusIndicator.open = false;
    },
    openIndicator(sliceState) {
      sliceState.statusIndicator.open = true;
    },
  },
  extraReducers: builder => {
    addGlobalAsyncThunkActions(builder, fetchChainConfigs, 'chainConfig', true);
    addGlobalAsyncThunkActions(builder, askForWalletConnection, 'wallet', false);
    addGlobalAsyncThunkActions(builder, initWallet, 'wallet', false);
    addGlobalAsyncThunkActions(builder, doDisconnectWallet, 'wallet', false);
    addGlobalAsyncThunkActions(builder, askForNetworkChange, 'wallet', false);
    addGlobalAsyncThunkActions(builder, fetchAllPricesAction, 'prices', true);
    addGlobalAsyncThunkActions(builder, fetchApyAction, 'apy', true);
    addGlobalAsyncThunkActions(builder, fetchAllVaults, 'vaults', true);
    addGlobalAsyncThunkActions(builder, fetchVaultsLastHarvests, 'lastHarvests', true);
    addGlobalAsyncThunkActions(builder, fetchAllBoosts, 'boosts', true);
    addGlobalAsyncThunkActions(builder, fetchFees, 'fees', true);
    addGlobalAsyncThunkActions(builder, fetchAllMinters, 'minters', false);
    addGlobalAsyncThunkActions(builder, fetchAllMigrators, 'migrators', false);
    addGlobalAsyncThunkActions(builder, initiateBoostForm, 'boostForm', true);
    addGlobalAsyncThunkActions(builder, initiateMinterForm, 'minterForm', true);
    addGlobalAsyncThunkActions(builder, fetchBridgeConfig, 'bridgeConfig', true);
    addGlobalAsyncThunkActions(builder, fetchZapConfigsAction, 'zapConfigs', true);
    addGlobalAsyncThunkActions(builder, fetchZapSwapAggregatorsAction, 'zapSwapAggregators', true);
    addGlobalAsyncThunkActions(
      builder,
      fetchZapAggregatorTokenSupportAction,
      'zapAggregatorTokenSupport',
      true
    );
    addGlobalAsyncThunkActions(builder, fetchZapAmmsAction, 'zapAmms', true);
    addGlobalAsyncThunkActions(builder, fetchAllAddressBookAction, 'addressBook', true);
    addGlobalAsyncThunkActions(builder, fetchPlatforms, 'platforms', true);
    addGlobalAsyncThunkActions(builder, fetchBridges, 'bridges', true);
    addGlobalAsyncThunkActions(builder, fetchOnRampSupportedProviders, 'onRamp', true);
    addGlobalAsyncThunkActions(builder, fetchTreasury, 'treasury', true);
    addGlobalAsyncThunkActions(builder, fetchActiveProposals, 'proposals', false);
    addGlobalAsyncThunkActions(builder, fetchLastArticle, 'articles', false);
    addGlobalAsyncThunkActions(builder, fetchMerklCampaignsAction, 'merklCampaigns', false);
    addGlobalAsyncThunkActions(
      builder,
      fetchAllCurrentCowcentratedRanges,
      'currentCowcentratedRanges',
      false
    );

    addByChainAsyncThunkActions(builder, fetchAllContractDataByChainAction, ['contractData']);
    addByChainAsyncThunkActions(builder, fetchAddressBookAction, ['addressBook']);

    addByAddressByChainAsyncThunkActions(builder, fetchAllBalanceAction, ['balance']);
    addByAddressByChainAsyncThunkActions(builder, fetchAllAllowanceAction, ['allowance']);
    addByAddressByChainAsyncThunkActions(
      builder,
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
      ['balance', 'allowance']
    );
    addByAddressByChainAsyncThunkActions(builder, fetchClmHarvestsForUserChain, ['clmHarvests']);

    addByAddressAsyncThunkActions(builder, fetchWalletTimeline, ['timeline']);
    addByAddressAsyncThunkActions(builder, recalculateDepositedVaultsAction, ['depositedVaults']);
    addByAddressAsyncThunkActions(builder, initDashboardByAddress, ['dashboard']);
    addByAddressAsyncThunkActions(builder, fetchClmHarvestsForUser, ['clmHarvests']);
    addByAddressAsyncThunkActions(
      builder,
      fetchUserMerklRewardsAction,
      ['merklRewards'],
      ['merklRewards']
    );
  },
});

export const dataLoaderActions = dataLoaderSlice.actions;
