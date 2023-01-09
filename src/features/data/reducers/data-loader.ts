import { ActionReducerMapBuilder, AsyncThunk, createSlice } from '@reduxjs/toolkit';
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
import { fetchAllVaults } from '../actions/vaults';
import {
  askForNetworkChange,
  askForWalletConnection,
  doDisconnectWallet,
  initWallet,
} from '../actions/wallet';
import { fetchAllZapsAction } from '../actions/zap';
import { fetchAllMinters, initiateMinterForm } from '../actions/minters';
import { fetchAllInfoCards } from '../actions/info-cards';
import { initiateBridgeForm } from '../actions/bridge';
import { fetchPlatforms } from '../actions/platforms';
import { fetchOnRampSupportedProviders } from '../actions/on-ramp';
import { fetchFees } from '../actions/fees';
import { DataLoaderState, LoaderState } from './data-loader-types';
import { errorToString } from '../../../helpers/format';
import { fetchAllAmmsAction } from '../actions/amm';
import { fetchTreasury } from '../actions/treasury';

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
const dataLoaderStateInitByChainId: DataLoaderState['byChainId']['bsc'] = {
  contractData: dataLoaderStateInit,
  balance: dataLoaderStateInit,
  allowance: dataLoaderStateInit,
  addressBook: dataLoaderStateInit,
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
    fees: dataLoaderStateInit,
    wallet: dataLoaderStateInit,
    amms: dataLoaderStateInit,
    zaps: dataLoaderStateInit,
    depositForm: dataLoaderStateInit,
    withdrawForm: dataLoaderStateInit,
    boostForm: dataLoaderStateInit,
    addressBook: dataLoaderStateInit,
    minters: dataLoaderStateInit,
    minterForm: dataLoaderStateInit,
    infoCards: dataLoaderStateInit,
    bridge: dataLoaderStateInit,
    platforms: dataLoaderStateInit,
    onRamp: dataLoaderStateInit,
    treasury: dataLoaderStateInit,
  },
  byChainId: {},
};

/**
 * Handling those async actions is very generic
 * Use a helper function to handle each action state
 */
function addGlobalAsyncThunkActions(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, unknown, unknown>,
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

function addByChainAsyncThunkActions<ActionParams extends { chainId: string }>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, ActionParams, unknown>,
  stateKeys: Array<keyof DataLoaderState['byChainId']['bsc']>
) {
  builder.addCase(action.pending, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }
    for (const stateKey of stateKeys) {
      sliceState.byChainId[chainId][stateKey] = {
        ...dataLoaderStatePending,
        alreadyLoadedOnce: sliceState.byChainId[chainId][stateKey].alreadyLoadedOnce,
      };
    }
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }

    const msg = errorToString(action.error);
    // here, maybe put an error message
    for (const stateKey of stateKeys) {
      sliceState.byChainId[chainId][stateKey] = {
        alreadyLoadedOnce: sliceState.byChainId[chainId][stateKey].alreadyLoadedOnce,
        status: 'rejected',
        error: msg,
      };

      // something got rejected, we want to auto-open the indicator
      sliceState.statusIndicator.open = true;
    }
  });
  builder.addCase(action.fulfilled, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }
    for (const stateKey of stateKeys) {
      sliceState.byChainId[chainId][stateKey] = dataLoaderStateFulfilled;
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
    addGlobalAsyncThunkActions(builder, fetchAllBoosts, 'boosts', true);
    addGlobalAsyncThunkActions(builder, fetchFees, 'fees', true);
    addGlobalAsyncThunkActions(builder, fetchAllMinters, 'minters', false);
    addGlobalAsyncThunkActions(builder, fetchAllInfoCards, 'infoCards', false);
    addGlobalAsyncThunkActions(builder, initiateBoostForm, 'boostForm', true);
    addGlobalAsyncThunkActions(builder, initiateMinterForm, 'minterForm', true);
    addGlobalAsyncThunkActions(builder, initiateBridgeForm, 'bridge', true);
    addGlobalAsyncThunkActions(builder, fetchAllZapsAction, 'zaps', true);
    addGlobalAsyncThunkActions(builder, fetchAllAmmsAction, 'amms', true);
    addGlobalAsyncThunkActions(builder, fetchAllAddressBookAction, 'addressBook', true);
    addGlobalAsyncThunkActions(builder, fetchPlatforms, 'platforms', true);
    addGlobalAsyncThunkActions(builder, fetchOnRampSupportedProviders, 'onRamp', true);
    addGlobalAsyncThunkActions(builder, fetchTreasury, 'treasury', true);
    addByChainAsyncThunkActions(builder, fetchAllContractDataByChainAction, ['contractData']);
    addByChainAsyncThunkActions(builder, fetchAllBalanceAction, ['balance']);
    addByChainAsyncThunkActions(builder, fetchAllAllowanceAction, ['allowance']);
    addByChainAsyncThunkActions(builder, reloadBalanceAndAllowanceAndGovRewardsAndBoostData, [
      'balance',
      'allowance',
    ]);
    addByChainAsyncThunkActions(builder, fetchAddressBookAction, ['addressBook']);
  },
});

export const dataLoaderActions = dataLoaderSlice.actions;
