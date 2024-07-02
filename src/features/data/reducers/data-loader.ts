import type { ActionReducerMapBuilder, AsyncThunk } from '@reduxjs/toolkit';
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
  GlobalDataByAddressEntity,
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
  },
};

const dataLoaderStateInitByAddressByChainId: ChainIdDataByAddressByChainEntity = {
  balance: dataLoaderStateInit,
  allowance: dataLoaderStateInit,
  clmHarvests: dataLoaderStateInit,
  merklRewards: dataLoaderStateInit,
};

export const initialDataLoaderState: DataLoaderState = {
  instances: {
    wallet: false,
  },
  statusIndicator: {
    open: false,
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
  stateKey: keyof DataLoaderState['global'],
  openNetworkModalOnReject: boolean = false
) {
  builder.addCase(action.pending, sliceState => {
    sliceState.global[stateKey] = makePendingState(sliceState.global[stateKey]);
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    const msg = errorToString(action.error);
    // here, maybe put an error message
    sliceState.global[stateKey] = makeRejectedState(sliceState.global[stateKey], msg);

    // something got rejected, we want to auto-open the indicator
    if (openNetworkModalOnReject) {
      sliceState.statusIndicator.open = true;
    }
  });
  builder.addCase(action.fulfilled, sliceState => {
    sliceState.global[stateKey] = makeFulfilledState(sliceState.global[stateKey]);
  });
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
  let addressState = sliceState.byAddress[address];
  if (!addressState) {
    addressState = cloneDeep(dataLoaderStateInitByAddress);
    sliceState.byAddress = {
      ...sliceState.byAddress,
      [address]: addressState,
    };
  }

  return addressState;
}

function getOrCreateAddressChainState(
  sliceState: Draft<DataLoaderState>,
  chainId: string,
  address: string
) {
  const addressState = getOrCreateAddressState(sliceState, address);

  let chainState: ChainIdDataByAddressByChainEntity | undefined = addressState.byChainId[chainId];
  if (!chainState) {
    chainState = cloneDeep(dataLoaderStateInitByAddressByChainId);
    sliceState.byAddress[address].byChainId = {
      ...sliceState.byAddress[address].byChainId,
      [chainId]: chainState,
    };
  }

  return chainState;
}

function addByChainAsyncThunkActions<ActionParams extends { chainId: ChainEntity['id'] }>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, ActionParams, { state: BeefyState }>,
  stateKeys: Array<keyof ChainIdDataEntity>
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

        // something got rejected, we want to auto-open the indicator
        sliceState.statusIndicator.open = true;
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
  stateKeys: Array<keyof ChainIdDataByAddressByChainEntity>
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
  stateKeys: Array<keyof GlobalDataByAddressEntity>
) {
  builder
    .addCase(action.pending, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);

      for (const stateKey of stateKeys) {
        addressState.global[stateKey] = makePendingState(addressState.global[stateKey]);
      }
    })
    .addCase(action.rejected, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);
      const error = errorToString(action.error);

      for (const stateKey of stateKeys) {
        addressState.global[stateKey] = makeRejectedState(addressState.global[stateKey], error);
      }
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);

      for (const stateKey of stateKeys) {
        addressState.global[stateKey] = makeFulfilledState(addressState.global[stateKey]);
      }
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
    addByAddressByChainAsyncThunkActions(builder, fetchUserMerklRewardsAction, ['merklRewards']);

    addByAddressAsyncThunkActions(builder, fetchWalletTimeline, ['timeline']);
    addByAddressAsyncThunkActions(builder, recalculateDepositedVaultsAction, ['depositedVaults']);
    addByAddressAsyncThunkActions(builder, initDashboardByAddress, ['dashboard']);
    addByAddressAsyncThunkActions(builder, fetchClmHarvestsForUser, ['clmHarvests']);
  },
});

export const dataLoaderActions = dataLoaderSlice.actions;
