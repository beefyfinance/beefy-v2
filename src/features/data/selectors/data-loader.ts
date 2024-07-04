import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import type { VaultEntity } from '../entities/vault';
import { shouldVaultShowInterest } from '../entities/vault';
import { selectVaultById } from './vaults';
import { createCachedSelector } from 're-reselect';
import {
  type ChainIdDataByAddressByChainEntity,
  type ChainIdDataEntity,
  type DataLoaderState,
  type GlobalDataByAddressEntity,
  isInitialLoader,
  isPending,
  type LoaderState,
} from '../reducers/data-loader-types';

export function loaderFulfilledOnce(state: LoaderState | undefined): boolean {
  return !!state && state.lastFulfilled !== undefined;
}

export function loaderFulfilledRecently(
  state: LoaderState | undefined,
  recentSeconds: number = 60
): boolean {
  return (
    !!state &&
    state.lastFulfilled !== undefined &&
    state.lastFulfilled > Date.now() - 1000 * recentSeconds
  );
}

export function loaderDispatchedRecently(
  state: LoaderState | undefined,
  recentSeconds: number = 30
): boolean {
  return (
    !!state &&
    state.lastDispatched !== undefined &&
    state.lastDispatched > Date.now() - 1000 * recentSeconds
  );
}

/** @returns true if never loaded, or if loader was never fulfilled and was not dispatched recently */
export function shouldLoadData(state: LoaderState | undefined): boolean {
  return (
    isInitialLoader(state) || (!loaderFulfilledOnce(state) && !loaderDispatchedRecently(state))
  );
}

/** @returns true if never loaded, or if loader was not fulfilled recently and was not dispatched recently */
export function shouldLoadDataRecent(state: LoaderState | undefined, recentSeconds: number = 60) {
  return (
    isInitialLoader(state) ||
    (!loaderFulfilledRecently(state, recentSeconds) && !loaderDispatchedRecently(state))
  );
}

export function selectIsGlobalDataAvailable(
  state: BeefyState,
  key: keyof DataLoaderState['global']
) {
  return loaderFulfilledOnce(state.ui.dataLoader.global[key]);
}

export function selectIsChainDataAvailable(
  state: BeefyState,
  chainId: ChainEntity['id'],
  key: keyof ChainIdDataEntity
) {
  return loaderFulfilledOnce(state.ui.dataLoader.byChainId[chainId]?.[key]);
}

export function selectIsAddressDataAvailable(
  state: BeefyState,
  walletAddress: string,
  key: keyof GlobalDataByAddressEntity
) {
  return loaderFulfilledOnce(state.ui.dataLoader.byAddress[walletAddress]?.global[key]);
}

export function selectIsAddressChainDataAvailable(
  state: BeefyState,
  walletAddress: string,
  chainId: ChainEntity['id'],
  key: keyof ChainIdDataByAddressByChainEntity
) {
  return loaderFulfilledOnce(
    state.ui.dataLoader.byAddress[walletAddress]?.byChainId[chainId]?.[key]
  );
}

export function selectIsGlobalDataIdle(state: BeefyState, key: keyof DataLoaderState['global']) {
  return isInitialLoader(state.ui.dataLoader.global[key]);
}

export function selectIsChainDataIdle(
  state: BeefyState,
  chainId: ChainEntity['id'],
  key: keyof ChainIdDataEntity
) {
  return isInitialLoader(state.ui.dataLoader.byChainId[chainId]?.[key]);
}

export function selectIsAddressDataIdle(
  state: BeefyState,
  walletAddress: string,
  key: keyof GlobalDataByAddressEntity
) {
  return isInitialLoader(state.ui.dataLoader.byAddress[walletAddress]?.global[key]);
}

export function selectIsAddressChainDataIdle(
  state: BeefyState,
  walletAddress: string,
  chainId: ChainEntity['id'],
  key: keyof ChainIdDataByAddressByChainEntity
) {
  return isInitialLoader(state.ui.dataLoader.byAddress[walletAddress]?.byChainId[chainId]?.[key]);
}

export const selectIsPriceAvailable = (state: BeefyState) =>
  selectIsGlobalDataAvailable(state, 'prices');

export const selectIsConfigAvailable = (state: BeefyState) =>
  selectIsGlobalDataAvailable(state, 'chainConfig') &&
  selectIsGlobalDataAvailable(state, 'vaults') &&
  selectIsGlobalDataAvailable(state, 'boosts') &&
  selectIsGlobalDataAvailable(state, 'platforms');

export const selectVaultApyAvailable = (state: BeefyState, vaultId: VaultEntity['id']) => {
  if (!selectIsConfigAvailable(state)) {
    return false;
  }
  const vault = selectVaultById(state, vaultId);
  const chainId = vault.chainId;

  return (
    selectIsChainDataAvailable(state, chainId, 'contractData') &&
    selectIsGlobalDataAvailable(state, 'apy')
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
        loaderFulfilledOnce(byChainId[chainId].contractData) &&
        loaderFulfilledOnce(byAddress[walletAddress]?.byChainId[chainId]?.balance)
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
  selectIsGlobalDataAvailable(state, 'addressBook') ||
  selectIsChainDataAvailable(state, chainId, 'addressBook');

export const selectShouldInitProposals = (state: BeefyState) => {
  return isInitialLoader(state.ui.dataLoader.global.proposals);
};

export const selectShouldInitArticles = (state: BeefyState) => {
  return isInitialLoader(state.ui.dataLoader.global.articles);
};

export const selectIsContractDataLoadedOnChain = (state: BeefyState, chainId: ChainEntity['id']) =>
  selectIsChainDataAvailable(state, chainId, 'contractData');

export const selectIsZapLoaded = (state: BeefyState) =>
  selectIsGlobalDataAvailable(state, 'zapConfigs') &&
  selectIsGlobalDataAvailable(state, 'zapSwapAggregators') &&
  selectIsGlobalDataAvailable(state, 'zapAggregatorTokenSupport') &&
  selectIsGlobalDataAvailable(state, 'zapAmms');

export const selectShouldInitZapAmms = (state: BeefyState) =>
  selectIsGlobalDataIdle(state, 'zapAmms');
export const selectShouldInitZapConfigs = (state: BeefyState) =>
  selectIsGlobalDataIdle(state, 'zapConfigs');
export const selectShouldInitZapSwapAggregators = (state: BeefyState) =>
  selectIsGlobalDataIdle(state, 'zapSwapAggregators');
export const selectShouldInitZapAggregatorTokenSupport = (state: BeefyState) =>
  selectIsGlobalDataIdle(state, 'zapAggregatorTokenSupport');

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

export const selectIsWalletTimelineForUserIdle = (state: BeefyState, walletAddress: string) => {
  return isInitialLoader(state.ui.dataLoader.byAddress[walletAddress]?.global.timeline);
};

export const selectIsWalletTimelineForUserPending = (state: BeefyState, walletAddress: string) => {
  return isPending(state.ui.dataLoader.byAddress[walletAddress]?.global.timeline);
};

export const selectIsWalletTimelineForUserRecent = (state: BeefyState, walletAddress: string) => {
  return loaderFulfilledRecently(state.ui.dataLoader.byAddress[walletAddress]?.global.timeline);
};

export const selectIsGlobalAddressBookAvailable = (state: BeefyState) =>
  selectIsGlobalDataAvailable(state, 'addressBook');

export const selectShouldInitDashboardForUser = (state: BeefyState, walletAddress: string) => {
  if (!walletAddress) {
    return false;
  }

  return (
    selectIsConfigAvailable(state) &&
    selectIsGlobalAddressBookAvailable(state) &&
    shouldLoadDataRecent(state.ui.dataLoader.byAddress[walletAddress]?.global.dashboard, 300)
  );
};

export const selectDashboardShouldLoadBalanceForChainUser = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  walletAddress: string
) =>
  shouldLoadDataRecent(state.ui.dataLoader.byAddress[walletAddress]?.byChainId[chainId]?.balance);

export const selectDashboardShouldLoadTimelineForUser = (
  state: BeefyState,
  walletAddress: string
) => shouldLoadDataRecent(state.ui.dataLoader.byAddress[walletAddress]?.global.timeline);

export const selectDashboardShouldLoadClmHarvestsForUser = (
  state: BeefyState,
  walletAddress: string
) => shouldLoadDataRecent(state.ui.dataLoader.byAddress[walletAddress]?.global.clmHarvests);

export const selectIsMerklRewardsForUserChainRecent = (
  state: BeefyState,
  walletAddress: string,
  chainId: string,
  recentSeconds: number = 30 * 60
) =>
  loaderFulfilledRecently(
    state.ui.dataLoader.byAddress[walletAddress]?.byChainId[chainId]?.merklRewards,
    recentSeconds || 30 * 60
  );

export const selectShouldLoadAllCurrentCowcentratedRanges = (
  state: BeefyState,
  recentSeconds: number = 180
) => shouldLoadDataRecent(state.ui.dataLoader.global.currentCowcentratedRanges, recentSeconds);
