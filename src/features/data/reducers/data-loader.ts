import type { ActionReducerMapBuilder, AsyncThunk, SerializedError } from '@reduxjs/toolkit';
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
import { fetchAllMigrators } from '../actions/migrator.ts';
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
    open: false,
    excludeChainIds: [],
    openBy: {
      global: {},
      byChainId: {},
      byAddress: {},
    },
  },
  global: {
    chainConfig: dataLoaderStateInit,
    prices: dataLoaderStateInit,
    apy: dataLoaderStateInit,
    avgApy: dataLoaderStateInit,
    promos: dataLoaderStateInit,
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
    curators: dataLoaderStateInit,
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
    stellaSwapRewards: dataLoaderStateInit,
    beGemsCampaign: dataLoaderStateInit,
    revenue: dataLoaderStateInit,
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
function addGlobalAsyncThunkActions<TPayload, TArg>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<
    TPayload,
    TArg,
    {
      state: unknown;
    }
  >,
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
    if (fetchChainConfigs.fulfilled.match(action)) {
      sliceState.statusIndicator.excludeChainIds = action.payload.chainConfigs
        .filter(c => c.eol)
        .map(c => c.id);
    }
    setGlobalFulfilled(sliceState, stateKey, openNetworkModalOnReject);
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
    setOpenByGlobal(sliceState, stateKey, true);
  }
}

function setGlobalFulfilled(
  sliceState: Draft<DataLoaderState>,
  stateKey: LoaderGlobalKey,
  openNetworkModalOnReject: boolean = false
) {
  sliceState.global[stateKey] = makeFulfilledState(sliceState.global[stateKey]);
  if (openNetworkModalOnReject) {
    setOpenByGlobal(sliceState, stateKey, false);
  }
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
  stateKeys: Array<LoaderChainKey>,
  openNetworkModalOnReject: boolean = false
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
        if (openNetworkModalOnReject) {
          setOpenByChainId(sliceState, chainId, stateKey, true);
        }
      }
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const chainId = action.meta?.arg.chainId;
      const chainState = getOrCreateChainState(sliceState, chainId);

      for (const stateKey of stateKeys) {
        chainState[stateKey] = makeFulfilledState(chainState[stateKey]);
        if (openNetworkModalOnReject) {
          setOpenByChainId(sliceState, chainId, stateKey, false);
        }
      }
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
  stateKeys: Array<LoaderAddressChainKey>,
  openNetworkModalOnReject: boolean = false
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
        if (openNetworkModalOnReject) {
          setOpenByAddressByChainId(
            sliceState,
            action.meta.arg.walletAddress,
            chainId,
            stateKey,
            true
          );
        }
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
        if (openNetworkModalOnReject) {
          setOpenByAddressByChainId(
            sliceState,
            action.meta.arg.walletAddress,
            chainId,
            stateKey,
            false
          );
        }
      }
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
  globalKeys?: Array<LoaderGlobalKey>,
  openNetworkModalOnReject: boolean = false
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
        if (openNetworkModalOnReject) {
          setOpenByAddressByGlobal(sliceState, action.meta.arg.walletAddress, addressKey, true);
        }
      }

      globalKeys?.forEach(globalKey =>
        setGlobalRejected(sliceState, globalKey, action.error, openNetworkModalOnReject)
      );
    })
    .addCase(action.fulfilled, (sliceState, action) => {
      const addressState = getOrCreateAddressState(sliceState, action.meta.arg.walletAddress);

      for (const addressKey of addressKeys) {
        addressState.global[addressKey] = makeFulfilledState(addressState.global[addressKey]);
        if (openNetworkModalOnReject) {
          setOpenByAddressByGlobal(sliceState, action.meta.arg.walletAddress, addressKey, false);
        }
      }

      globalKeys?.forEach(globalKey =>
        setGlobalFulfilled(sliceState, globalKey, openNetworkModalOnReject)
      );
    });
}

function setOpenByGlobal(
  sliceState: Draft<DataLoaderState>,
  stateKey: LoaderGlobalKey,
  open: boolean
) {
  if (sliceState.statusIndicator.openBy.global[stateKey] === open) {
    return;
  }
  sliceState.statusIndicator.openBy.global[stateKey] = open;

  recalculateStatusIndicatorOpenState(sliceState, open);
}

function setOpenByChainId(
  sliceState: Draft<DataLoaderState>,
  chainId: ChainId,
  stateKey: LoaderChainKey,
  open: boolean
) {
  // ignore eol chains
  if (sliceState.statusIndicator.excludeChainIds.includes(chainId)) {
    return;
  }

  if (sliceState.statusIndicator.openBy.byChainId[chainId]?.[stateKey] === open) {
    return;
  }

  sliceState.statusIndicator.openBy.byChainId[chainId] ??= {};
  sliceState.statusIndicator.openBy.byChainId[chainId][stateKey] = open;

  recalculateStatusIndicatorOpenState(sliceState, open);
}

function setOpenByAddressByGlobal(
  sliceState: Draft<DataLoaderState>,
  address: string,
  stateKey: LoaderAddressKey,
  open: boolean
) {
  const addressKey = address.toLowerCase();
  if (sliceState.statusIndicator.openBy.byAddress[addressKey]?.global[stateKey] === open) {
    return;
  }

  sliceState.statusIndicator.openBy.byAddress[addressKey] ??= {
    global: {},
    byChainId: {},
  };
  sliceState.statusIndicator.openBy.byAddress[addressKey].global[stateKey] = open;

  recalculateStatusIndicatorOpenState(sliceState, open);
}

function setOpenByAddressByChainId(
  sliceState: Draft<DataLoaderState>,
  address: string,
  chainId: ChainId,
  stateKey: LoaderAddressChainKey,
  open: boolean
) {
  // ignore eol chains
  if (sliceState.statusIndicator.excludeChainIds.includes(chainId)) {
    return;
  }

  const addressKey = address.toLowerCase();
  if (
    sliceState.statusIndicator.openBy.byAddress[addressKey]?.byChainId[chainId]?.[stateKey] === open
  ) {
    return;
  }

  sliceState.statusIndicator.openBy.byAddress[addressKey] ??= {
    global: {},
    byChainId: {},
  };
  sliceState.statusIndicator.openBy.byAddress[addressKey].byChainId[chainId] ??= {};
  sliceState.statusIndicator.openBy.byAddress[addressKey].byChainId[chainId][stateKey] = open;

  recalculateStatusIndicatorOpenState(sliceState, open);
}

function recalculateStatusIndicatorOpenState(sliceState: Draft<DataLoaderState>, open?: boolean) {
  sliceState.statusIndicator.open =
    // just opened
    open ||
    // any global open
    Object.values(sliceState.statusIndicator.openBy.global).some(v => v) ||
    // any by chain-global open
    Object.values(sliceState.statusIndicator.openBy.byChainId).some(chainState =>
      Object.values(chainState).some(v => v)
    ) ||
    // any by address open
    Object.values(sliceState.statusIndicator.openBy.byAddress).some(
      addressState =>
        Object.values(addressState.global).some(v => v) ||
        Object.values(addressState.byChainId).some(chainState =>
          Object.values(chainState).some(v => v)
        )
    );

  if (import.meta.env.DEV) {
    if (sliceState.statusIndicator.open) {
      console.dir(
        {
          global: Object.entries(sliceState.statusIndicator.openBy.global)
            .filter(([, v]) => v)
            .map(([k]) => k),
          byChainId: Object.entries(sliceState.statusIndicator.openBy.byChainId).reduce(
            (acc, [chainId, states]) => {
              const openStates = Object.entries(states)
                .filter(([, v]) => v)
                .map(([k]) => k);
              if (openStates.length > 0) {
                acc[chainId] = openStates;
              }
              return acc;
            },
            {} as Record<string, string[]>
          ),
          byAddress: Object.entries(sliceState.statusIndicator.openBy.byAddress).reduce(
            (acc, [address, addrState]) => {
              const openGlobalStates = Object.entries(addrState.global)
                .filter(([, v]) => v)
                .map(([k]) => k);
              const openByChainStates = Object.entries(addrState.byChainId).reduce(
                (chainAcc, [chainId, states]) => {
                  const openStates = Object.entries(states)
                    .filter(([, v]) => v)
                    .map(([k]) => k);
                  if (openStates.length > 0) {
                    chainAcc[chainId] = openStates;
                  }
                  return chainAcc;
                },
                {} as Record<string, string[]>
              );

              if (openGlobalStates.length > 0 || Object.keys(openByChainStates).length > 0) {
                acc[address] = {
                  global: openGlobalStates,
                  byChainId: openByChainStates,
                };
              }
              return acc;
            },
            {} as Record<string, { global: string[]; byChainId: Record<string, string[]> }>
          ),
        },
        { depth: null }
      );
    }
  }
}

export const dataLoaderSlice = createSlice({
  name: 'dataLoader',
  initialState: initialDataLoaderState,
  reducers: {
    dismissNotification(sliceState) {
      sliceState.statusIndicator.open = false;
      sliceState.statusIndicator.openBy = {
        global: {},
        byChainId: {},
        byAddress: {},
      };
    },
  },
  extraReducers: builder => {
    addGlobalAsyncThunkActions(builder, fetchChainConfigs, 'chainConfig', true);
    // addGlobalAsyncThunkActions(builder, askForWalletConnection, 'wallet', false);
    addGlobalAsyncThunkActions(builder, initWallet, 'wallet', false);
    // addGlobalAsyncThunkActions(builder, doDisconnectWallet, 'wallet', false);
    // addGlobalAsyncThunkActions(builder, askForNetworkChange, 'wallet', false);
    addGlobalAsyncThunkActions(builder, fetchAllPricesAction, 'prices', true);
    addGlobalAsyncThunkActions(builder, fetchApyAction, 'apy', true);
    addGlobalAsyncThunkActions(builder, fetchAvgApyAction, 'avgApy', true);
    addGlobalAsyncThunkActions(builder, fetchAllVaults, 'vaults', true);
    addGlobalAsyncThunkActions(builder, fetchVaultsLastHarvests, 'lastHarvests', true);
    addGlobalAsyncThunkActions(builder, initPromos, 'promos', true);
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
    addGlobalAsyncThunkActions(builder, fetchCurators, 'curators', true);
    addGlobalAsyncThunkActions(builder, fetchPlatforms, 'platforms', true);
    addGlobalAsyncThunkActions(builder, fetchBridges, 'bridges', true);
    addGlobalAsyncThunkActions(builder, fetchTreasury, 'treasury', true);
    addGlobalAsyncThunkActions(builder, fetchActiveProposals, 'proposals', false);
    addGlobalAsyncThunkActions(builder, fetchLastArticle, 'articles', false);
    addGlobalAsyncThunkActions(builder, fetchOffChainCampaignsAction, 'merklCampaigns', false);
    addGlobalAsyncThunkActions(
      builder,
      fetchAllCurrentCowcentratedRanges,
      'currentCowcentratedRanges',
      false
    );
    addGlobalAsyncThunkActions(builder, initCampaignBeGems, 'beGemsCampaign', false);
    addGlobalAsyncThunkActions(builder, fetchWeeklyRevenueStats, 'revenue', true);

    addByChainAsyncThunkActions(builder, fetchAllContractDataByChainAction, ['contractData'], true);
    addByChainAsyncThunkActions(builder, fetchAddressBookAction, ['addressBook'], true);

    addByAddressByChainAsyncThunkActions(builder, fetchAllBalanceAction, ['balance'], true);
    addByAddressByChainAsyncThunkActions(builder, fetchAllAllowanceAction, ['allowance'], true);
    addByAddressByChainAsyncThunkActions(
      builder,
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
      ['balance', 'allowance'],
      true
    );
    addByAddressByChainAsyncThunkActions(
      builder,
      fetchClmHarvestsForVaultsOfUserOnChain,
      ['clmHarvests'],
      false
    );

    addByAddressAsyncThunkActions(builder, fetchWalletTimeline, ['timeline'], undefined, false);
    addByAddressAsyncThunkActions(
      builder,
      recalculateDepositedVaultsAction,
      ['depositedVaults'],
      undefined,
      false
    );
    addByAddressAsyncThunkActions(builder, initDashboardByAddress, ['dashboard'], undefined, false);
    addByAddressAsyncThunkActions(
      builder,
      fetchClmHarvestsForUser,
      ['clmHarvests'],
      undefined,
      false
    );
    addByAddressAsyncThunkActions(
      builder,
      fetchUserStellaSwapRewardsAction,
      ['stellaSwapRewards'],
      ['stellaSwapRewards'],
      false
    );
    addByAddressAsyncThunkActions(
      builder,
      fetchUserMerklRewardsAction,
      ['merklRewards'],
      ['merklRewards'],
      false
    );
  },
});

export const dataLoaderActions = dataLoaderSlice.actions;
