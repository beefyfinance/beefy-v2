import type { ActionReducerMapBuilder, AsyncThunk } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { fetchAllAllowanceAction } from '../actions/allowance';
import { fetchApyAction } from '../actions/apy';
import { fetchAllBalanceAction } from '../actions/balance';
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
  fetchZapSwapAggregatorsAction,
  fetchZapConfigsAction,
  fetchZapAggregatorTokenSupportAction,
  fetchZapAmmsAction,
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
} from './data-loader-types';
import { errorToString } from '../../../helpers/format';
import { fetchTreasury } from '../actions/treasury';
import { fetchWalletTimeline } from '../actions/analytics';
import { fetchActiveProposals } from '../actions/proposal';
import { fetchBridges } from '../actions/bridges';
import { fetchAllMigrators } from '../actions/migrator';
import { fetchLastArticle } from '../actions/articles';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';

const dataLoaderStateInit: LoaderState = {
  alreadyLoadedOnce: false,
  status: 'init',
  error: null,
};

const dataLoaderStateFulfilled: LoaderState = {
  alreadyLoadedOnce: true,
  status: 'fulfilled',
  error: null,
};

const dataLoaderStatePending: LoaderState = {
  alreadyLoadedOnce: false,
  status: 'pending',
  error: null,
};

const dataLoaderStateInitByChainId: ChainIdDataEntity = {
  contractData: dataLoaderStateInit,
  addressBook: dataLoaderStateInit,
};

const dataLoaderStateInitByAddress = {
  byChainId: {},
  global: {
    timeline: dataLoaderStateInit,
  },
};

const dataLoaderStateInitByAddressByChainId: ChainIdDataByAddressByChainEntity = {
  balance: dataLoaderStateInit,
  allowance: dataLoaderStateInit,
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
  },
  byChainId: {},
  byAddress: {},
};

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
    sliceState.global[stateKey] = {
      ...dataLoaderStatePending,
      alreadyLoadedOnce: sliceState.global[stateKey].alreadyLoadedOnce,
    };
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    const msg = errorToString(action.error);
    // here, maybe put an error message
    sliceState.global[stateKey] = {
      status: 'rejected',
      error: msg,
      alreadyLoadedOnce: sliceState.global[stateKey].alreadyLoadedOnce,
    };

    // something got rejected, we want to auto-open the indicator
    if (openNetworkModalOnReject) {
      sliceState.statusIndicator.open = true;
    }
  });
  builder.addCase(action.fulfilled, sliceState => {
    sliceState.global[stateKey] = dataLoaderStateFulfilled;
  });
}

function getOrCreateChainState(sliceState: DataLoaderState, chainId: string) {
  let chainState: ChainIdDataEntity | undefined = sliceState.byChainId[chainId];
  if (!chainState) {
    chainState = { ...dataLoaderStateInitByChainId };
    sliceState.byChainId = {
      ...sliceState.byChainId,
      [chainId]: chainState,
    };
  }
  return chainState;
}

function getOrCreateAddressState(sliceState: DataLoaderState, address: string) {
  let addressState = sliceState.byAddress[address];
  if (!addressState) {
    addressState = { ...dataLoaderStateInitByAddress };
    sliceState.byAddress = {
      ...sliceState.byAddress,
      [address]: addressState,
    };
  }

  return addressState;
}

function getOrCreateAddressChainState(
  sliceState: DataLoaderState,
  chainId: string,
  address: string
) {
  const addressState = getOrCreateAddressState(sliceState, address);

  let chainState: ChainIdDataByAddressByChainEntity | undefined = addressState.byChainId[chainId];
  if (!chainState) {
    chainState = { ...dataLoaderStateInitByAddressByChainId };
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
        chainState[stateKey] = {
          ...dataLoaderStatePending,
          alreadyLoadedOnce: true,
        };
      }
    })
    .addCase(action.rejected, (sliceState, action) => {
      const chainId = action.meta?.arg.chainId;
      const chainState = getOrCreateChainState(sliceState, chainId);
      const error = errorToString(action.error);

      for (const stateKey of stateKeys) {
        chainState[stateKey] = {
          alreadyLoadedOnce: chainState[stateKey].alreadyLoadedOnce,
          status: 'rejected',
          error,
        };

        // something got rejected, we want to auto-open the indicator
        sliceState.statusIndicator.open = true;
      }
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const chainId = action.meta?.arg.chainId;
      const chainState = getOrCreateChainState(sliceState, chainId);

      for (const stateKey of stateKeys) {
        chainState[stateKey] = { ...dataLoaderStateFulfilled };
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
        chainState[stateKey] = {
          ...dataLoaderStatePending,
          alreadyLoadedOnce: true,
        };
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
        chainState[stateKey] = {
          alreadyLoadedOnce: chainState[stateKey].alreadyLoadedOnce,
          status: 'rejected',
          error,
        };
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
        chainState[stateKey] = { ...dataLoaderStateFulfilled };
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
        addressState.global[stateKey] = {
          ...dataLoaderStatePending,
          alreadyLoadedOnce: true,
        };
      }
    })
    .addCase(action.rejected, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);
      const error = errorToString(action.error);

      for (const stateKey of stateKeys) {
        addressState.global[stateKey] = {
          alreadyLoadedOnce: addressState[stateKey].alreadyLoadedOnce,
          status: 'rejected',
          error,
        };
      }
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);

      for (const stateKey of stateKeys) {
        addressState.global[stateKey] = { ...dataLoaderStateFulfilled };
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

    addByChainAsyncThunkActions(builder, fetchAllContractDataByChainAction, ['contractData']);
    addByChainAsyncThunkActions(builder, fetchAddressBookAction, ['addressBook']);

    addByAddressByChainAsyncThunkActions(builder, fetchAllBalanceAction, ['balance']);
    addByAddressByChainAsyncThunkActions(builder, fetchAllAllowanceAction, ['allowance']);
    addByAddressByChainAsyncThunkActions(
      builder,
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
      ['balance', 'allowance']
    );

    addByAddressAsyncThunkActions(builder, fetchWalletTimeline, ['timeline']);
  },
});

export const dataLoaderActions = dataLoaderSlice.actions;
