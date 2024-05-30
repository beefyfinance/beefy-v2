import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import type { VaultEntity } from '../entities/vault';
import { shouldVaultShowInterest } from '../entities/vault';
import { selectVaultById } from './vaults';
import { createCachedSelector } from 're-reselect';
import {
  isInitialLoader,
  isPending,
  type LoaderState,
  type LoaderStateOnceFulfilled,
} from '../reducers/data-loader-types';

function isAvailable(
  state: LoaderState | LoaderStateOnceFulfilled | undefined
): state is LoaderStateOnceFulfilled {
  return !!state && state.lastFulfilled !== undefined;
}

function isRecent(
  state: LoaderState | LoaderStateOnceFulfilled | undefined,
  recentSeconds: number = 60
): state is LoaderStateOnceFulfilled {
  return isAvailable(state) && state.lastFulfilled > Date.now() - 1000 * recentSeconds;
}

export const selectIsPriceAvailable = (state: BeefyState) =>
  isAvailable(state.ui.dataLoader.global.prices);

export const selectIsConfigAvailable = (state: BeefyState) =>
  isAvailable(state.ui.dataLoader.global.chainConfig) &&
  isAvailable(state.ui.dataLoader.global.vaults) &&
  isAvailable(state.ui.dataLoader.global.boosts) &&
  isAvailable(state.ui.dataLoader.global.platforms);

export const selectVaultApyAvailable = (state: BeefyState, vaultId: VaultEntity['id']) => {
  if (!selectIsConfigAvailable(state)) {
    return false;
  }
  const vault = selectVaultById(state, vaultId);
  const chainId = vault.chainId;

  return (
    isAvailable(state.ui.dataLoader.byChainId[chainId]?.contractData) &&
    isAvailable(state.ui.dataLoader.global.apy) !== undefined
  );
};

/** Returns false if vault is retired or paused and not earning */
export const selectVaultShouldShowInterest = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (vault: VaultEntity) => shouldVaultShowInterest(vault)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsUserBalanceAvailable = createSelector(
  (state: BeefyState, _walletAddress: string | undefined) => selectIsConfigAvailable(state),
  (state: BeefyState, _walletAddress: string | undefined) => selectIsPriceAvailable(state),
  (state: BeefyState, _walletAddress: string | undefined) => state.ui.dataLoader.byChainId,
  (state: BeefyState, _walletAddress: string | undefined) => state.ui.dataLoader.byAddress,
  (state: BeefyState, walletAddress: string | undefined) => walletAddress,
  (configAvailable, pricesAvailable, byChainId, byAddress, walletAddress) => {
    if (!configAvailable || !pricesAvailable || !walletAddress) {
      return false;
    }
    for (const chainId in byChainId) {
      // if any chain has balance data, then balance data is available
      if (
        isAvailable(byChainId[chainId].contractData) &&
        isAvailable(byAddress[walletAddress]?.byChainId[chainId]?.balance)
      ) {
        return true;
      }
    }
    // if no chain has balance data
    // then balance data is unavailable
    return false;
  }
);

// vault list is available as soon as we load the config
export const selectIsVaultListAvailable = selectIsConfigAvailable;

export const selectIsWalletPending = (state: BeefyState) =>
  isPending(state.ui.dataLoader.global.wallet);

export const selectShouldInitAddressBook = (state: BeefyState, chainId: ChainEntity['id']) =>
  isInitialLoader(state.ui.dataLoader.global.addressBook) ||
  isInitialLoader(state.ui.dataLoader.byChainId[chainId]?.addressBook);

export const selectIsAddressBookLoaded = (state: BeefyState, chainId: ChainEntity['id']) =>
  isAvailable(state.ui.dataLoader.global.addressBook) ||
  isAvailable(state.ui.dataLoader.byChainId[chainId]?.addressBook);

export const selectShouldInitProposals = (state: BeefyState) => {
  return isInitialLoader(state.ui.dataLoader.global.proposals);
};

export const selectShouldInitArticles = (state: BeefyState) => {
  return isInitialLoader(state.ui.dataLoader.global.articles);
};

export const selectIsContractDataLoadedOnChain = (state: BeefyState, chainId: ChainEntity['id']) =>
  isAvailable(state.ui.dataLoader.byChainId[chainId]?.contractData);

export const selectIsZapLoaded = (state: BeefyState) =>
  isAvailable(state.ui.dataLoader.global.zapConfigs) &&
  isAvailable(state.ui.dataLoader.global.zapSwapAggregators) &&
  isAvailable(state.ui.dataLoader.global.zapAggregatorTokenSupport) &&
  isAvailable(state.ui.dataLoader.global.zapAmms);

export const selectDepositedVaultsStatusForUser = (state: BeefyState, walletAddress: string) => {
  return state.ui.dataLoader.byAddress[walletAddress]?.global.depositedVaults.status || 'idle';
};

export const selectIsClmHarvestsForUserChainPending = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  walletAddress: string
) => {
  return isPending(state.ui.dataLoader.byAddress[walletAddress]?.byChainId[chainId]?.clmHarvests);
};

export const selectIsClmHarvestsForUserPending = (state: BeefyState, walletAddress: string) => {
  return isPending(state.ui.dataLoader.byAddress[walletAddress]?.global.clmHarvests);
};

export const selectIsWalletTimelineForUserPending = (state: BeefyState, walletAddress: string) => {
  return isPending(state.ui.dataLoader.byAddress[walletAddress]?.global.timeline);
};

export const selectIsWalletTimelineForUserRecent = (state: BeefyState, walletAddress: string) => {
  return isRecent(state.ui.dataLoader.byAddress[walletAddress]?.global.timeline);
};

export const selectIsGlobalAddressBookAvailable = (state: BeefyState) =>
  isAvailable(state.ui.dataLoader.global.addressBook);

export const selectShouldInitDashboardForUser = (state: BeefyState, walletAddress: string) => {
  if (!walletAddress) {
    return false;
  }

  return (
    selectIsConfigAvailable(state) &&
    selectIsGlobalAddressBookAvailable(state) &&
    !isRecent(state.ui.dataLoader.byAddress[walletAddress]?.global.dashboard, 300)
  );
};

export const selectDashboardShouldLoadBalanceForChainUser = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  walletAddress: string
) => {
  const loader = state.ui.dataLoader.byAddress[walletAddress]?.byChainId[chainId]?.balance;
  // if never loaded, or not pending and not recently loaded
  return isInitialLoader(loader) || (!isPending(loader) && !isRecent(loader));
};

export const selectDashboardShouldLoadTimelineForUser = (
  state: BeefyState,
  walletAddress: string
) => {
  const loader = state.ui.dataLoader.byAddress[walletAddress]?.global.timeline;
  return isInitialLoader(loader) || (!isPending(loader) && !isRecent(loader));
};

export const selectDashboardShouldLoadClmHarvestsForUser = (
  state: BeefyState,
  walletAddress: string
) => {
  const loader = state.ui.dataLoader.byAddress[walletAddress]?.global.clmHarvests;
  return isInitialLoader(loader) || (!isPending(loader) && !isRecent(loader));
};
