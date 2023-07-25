import { createSlice } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder, AsyncThunk } from '@reduxjs/toolkit';
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
import type {
  ChainIdDataByAddressEntity,
  ChainIdDataEntity,
  DataLoaderState,
  LoaderState,
} from './data-loader-types';
import { errorToString } from '../../../helpers/format';
import { fetchAllAmmsAction } from '../actions/amm';
import { fetchTreasury } from '../actions/treasury';
import type { fetchWalletTimelineFulfilled } from '../actions/analytics';
import { fetchWalletTimeline } from '../actions/analytics';
import { fetchActiveProposals } from '../actions/proposal';
import { fetchBridges } from '../actions/bridges';
import { fetchAllMigrators } from '../actions/migrator';

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
  addressBook: dataLoaderStateInit,
};

const dataLoaderStateInitByAddresAndChainId = {
  byChainId: {},
};

const dataLoaderStateByChainIdWithAddress: ChainIdDataByAddressEntity = {
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
    analytics: dataLoaderStateInit,
    proposals: dataLoaderStateInit,
    bridges: dataLoaderStateInit,
    migrators: dataLoaderStateInit,
  },
  byChainId: {},
  byAddress: {},
  timelineByAddress: {},
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

function addByChainAsyncThunkActions<
  ActionParams extends { chainId: string; walletAddress?: string }
>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, ActionParams, unknown>,
  stateKeys: Array<keyof ChainIdDataEntity | keyof ChainIdDataByAddressEntity>,
  updateByAddress: boolean
) {
  builder.addCase(action.pending, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (updateByAddress) {
      const walletAddress = action.meta?.arg.walletAddress;
      if (sliceState.byAddress[walletAddress] === undefined) {
        sliceState.byAddress[walletAddress] = {
          ...dataLoaderStateInitByAddresAndChainId,
        };
      }

      if (sliceState.byAddress[walletAddress].byChainId[chainId] === undefined) {
        sliceState.byAddress[walletAddress].byChainId = {
          [chainId]: dataLoaderStateByChainIdWithAddress,
        };
      }
      for (const stateKey of stateKeys) {
        sliceState.byAddress[walletAddress].byChainId[chainId] = {
          [stateKey]: {
            ...dataLoaderStatePending,
            alreadyLoadedOnce: true,
          },
          ...sliceState.byAddress[walletAddress].byChainId[chainId],
        };
      }
    } else {
      if (sliceState.byChainId[chainId] === undefined) {
        sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
      }
      for (const stateKey of stateKeys) {
        sliceState.byChainId[chainId][stateKey] = {
          ...dataLoaderStatePending,
          alreadyLoadedOnce: true,
        };
      }
    }
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;

    const msg = errorToString(action.error);

    if (updateByAddress) {
      const walletAddress = action.meta?.arg.walletAddress;
      if (sliceState.byAddress[walletAddress] === undefined) {
        sliceState.byAddress[walletAddress] = {
          ...dataLoaderStateInitByAddresAndChainId,
        };
      }
      if (sliceState.byAddress[walletAddress].byChainId[chainId] === undefined) {
        sliceState.byAddress[walletAddress].byChainId[chainId] = {
          ...dataLoaderStateByChainIdWithAddress,
        };
      }
      for (const stateKey of stateKeys) {
        sliceState.byAddress[walletAddress].byChainId[chainId][stateKey] = {
          alreadyLoadedOnce:
            sliceState.byAddress[walletAddress].byChainId[chainId][stateKey].alreadyLoadedOnce,
          status: 'rejected',
          error: msg,
        };
      }
    } else {
      if (sliceState.byChainId[chainId] === undefined) {
        sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
      }
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
    }
  });
  builder.addCase(action.fulfilled, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (updateByAddress) {
      const walletAddress = action.meta?.arg.walletAddress;
      if (sliceState.byAddress[walletAddress] === undefined) {
        sliceState.byAddress[walletAddress] = {
          ...dataLoaderStateInitByAddresAndChainId,
        };
      }
      if (sliceState.byAddress[walletAddress].byChainId[chainId] === undefined) {
        sliceState.byAddress[walletAddress].byChainId[chainId] = {
          ...dataLoaderStateByChainIdWithAddress,
        };
      }
      for (const stateKey of stateKeys) {
        sliceState.byAddress[walletAddress].byChainId[chainId][stateKey] = dataLoaderStateFulfilled;
      }
    } else {
      if (sliceState.byChainId[chainId] === undefined) {
        sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
      }
      for (const stateKey of stateKeys) {
        sliceState.byChainId[chainId][stateKey] = dataLoaderStateFulfilled;
      }
    }
  });
}

function addByAddressAsyncThunkActions(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<fetchWalletTimelineFulfilled, { address: string }, unknown>
) {
  builder.addCase(action.pending, (sliceState, action) => {
    const address = action.meta?.arg.address;
    if (sliceState.timelineByAddress[address] === undefined) {
      sliceState.timelineByAddress[address] = dataLoaderStatePending;
    }
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    const address = action.meta?.arg.address;
    const msg = errorToString(action.error);

    if (sliceState.timelineByAddress[address] === undefined) {
      sliceState.timelineByAddress[address] = dataLoaderStateInit;
    }

    sliceState.timelineByAddress[address] = {
      alreadyLoadedOnce: true,
      status: 'rejected',
      error: msg,
    };
  });
  builder.addCase(action.fulfilled, (sliceState, action) => {
    const address = action.meta?.arg.address;
    if (sliceState.timelineByAddress[address] === undefined) {
      sliceState.timelineByAddress[address] = dataLoaderStatePending;
    }

    sliceState.timelineByAddress[address] = { ...dataLoaderStateFulfilled };
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
    addGlobalAsyncThunkActions(builder, fetchAllMigrators, 'migrators', false);
    addGlobalAsyncThunkActions(builder, fetchAllInfoCards, 'infoCards', false);
    addGlobalAsyncThunkActions(builder, initiateBoostForm, 'boostForm', true);
    addGlobalAsyncThunkActions(builder, initiateMinterForm, 'minterForm', true);
    addGlobalAsyncThunkActions(builder, initiateBridgeForm, 'bridge', true);
    addGlobalAsyncThunkActions(builder, fetchAllZapsAction, 'zaps', true);
    addGlobalAsyncThunkActions(builder, fetchAllAmmsAction, 'amms', true);
    addGlobalAsyncThunkActions(builder, fetchAllAddressBookAction, 'addressBook', true);
    addGlobalAsyncThunkActions(builder, fetchPlatforms, 'platforms', true);
    addGlobalAsyncThunkActions(builder, fetchBridges, 'bridges', true);
    addGlobalAsyncThunkActions(builder, fetchOnRampSupportedProviders, 'onRamp', true);
    addGlobalAsyncThunkActions(builder, fetchTreasury, 'treasury', true);
    addGlobalAsyncThunkActions(builder, fetchActiveProposals, 'proposals', false);
    addByChainAsyncThunkActions(
      builder,
      fetchAllContractDataByChainAction,
      ['contractData'],
      false
    );
    addByChainAsyncThunkActions(builder, fetchAddressBookAction, ['addressBook'], false);
    addByChainAsyncThunkActions(builder, fetchAllBalanceAction, ['balance'], true);
    addByChainAsyncThunkActions(builder, fetchAllAllowanceAction, ['allowance'], true);
    addByChainAsyncThunkActions(
      builder,
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
      ['balance', 'allowance'],
      true
    );
    addByAddressAsyncThunkActions(builder, fetchWalletTimeline);
  },
});

export const dataLoaderActions = dataLoaderSlice.actions;
