import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { VaultEntity } from '../entities/vault.ts';
import { shouldVaultShowInterest } from '../entities/vault.ts';
import { selectVaultById } from './vaults.ts';
import { createCachedSelector } from 're-reselect';
import {
  createAddressChainDataSelector,
  createAddressDataSelector,
  createChainDataSelector,
  createGlobalDataSelector,
  createHasLoaderDispatchedRecentlyEvaluator,
  createShouldLoaderLoadRecentEvaluator,
  type GlobalDataSelectorFn,
  hasLoaderFulfilledOnce,
  hasLoaderFulfilledRecently,
  isLoaderPending,
  isLoaderRejected,
  shouldLoaderLoadOnce,
  shouldLoaderLoadRecent,
} from './data-loader-helpers.ts';
import { keys } from '../../../helpers/object.ts';

export const selectIsChainConfigAvailable = createGlobalDataSelector(
  'chainConfig',
  hasLoaderFulfilledOnce
);
export const selectIsVaultsAvailable = createGlobalDataSelector('vaults', hasLoaderFulfilledOnce);
export const selectIsPromosAvailable = createGlobalDataSelector('promos', hasLoaderFulfilledOnce);
export const selectIsPlatformsAvailable = createGlobalDataSelector(
  'platforms',
  hasLoaderFulfilledOnce
);
export const selectIsConfigAvailable: GlobalDataSelectorFn = createSelector(
  selectIsChainConfigAvailable,
  selectIsVaultsAvailable,
  selectIsPromosAvailable,
  selectIsPlatformsAvailable,
  (...availables) => availables.every(available => available === true)
);

export const selectIsPricesAvailable = createGlobalDataSelector('prices', hasLoaderFulfilledOnce);
export const selectIsApyAvailable = createGlobalDataSelector('apy', hasLoaderFulfilledOnce);

export const selectIsContractDataLoadedOnChain = createChainDataSelector(
  'contractData',
  hasLoaderFulfilledOnce
);

export const selectIsVaultApyAvailable = (state: BeefyState, vaultId: VaultEntity['id']) => {
  if (!selectIsConfigAvailable(state) || !selectIsApyAvailable(state)) {
    return false;
  }

  const vault = selectVaultById(state, vaultId);
  return selectIsContractDataLoadedOnChain(state, vault.chainId);
};

/** Returns false if vault is retired or paused and not earning */
export const selectVaultShouldShowInterest = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (vault: VaultEntity) => shouldVaultShowInterest(vault)
)((_, vaultId: VaultEntity['id']) => vaultId);

export const selectIsUserBalanceAvailable = createSelector(
  (state: BeefyState, _walletAddress: string | undefined) => selectIsConfigAvailable(state),
  (state: BeefyState, _walletAddress: string | undefined) => selectIsPricesAvailable(state),
  (state: BeefyState, _walletAddress: string | undefined) => state.ui.dataLoader.byChainId,
  (state: BeefyState, _walletAddress: string | undefined) => state.ui.dataLoader.byAddress,
  (_state: BeefyState, walletAddress: string | undefined) => walletAddress?.toLowerCase(),
  (configAvailable, pricesAvailable, byChainId, byAddress, walletAddress) => {
    if (!configAvailable || !pricesAvailable || !walletAddress) {
      return false;
    }
    for (const chainId of keys(byChainId)) {
      // if any chain has balance data, then balance data is available
      if (
        hasLoaderFulfilledOnce(byChainId[chainId]?.contractData) &&
        hasLoaderFulfilledOnce(byAddress[walletAddress]?.byChainId[chainId]?.balance)
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

export const selectIsWalletPending = createGlobalDataSelector('wallet', isLoaderPending);

const selectShouldInitAddressBookGlobal = createGlobalDataSelector(
  'addressBook',
  shouldLoaderLoadOnce
);
export const selectIsAddressBookLoadedGlobal = createGlobalDataSelector(
  'addressBook',
  hasLoaderFulfilledOnce
);

const selectShouldInitAddressBookChain = createChainDataSelector(
  'addressBook',
  shouldLoaderLoadOnce
);
const selectIsAddressBookLoadedChain = createChainDataSelector(
  'addressBook',
  hasLoaderFulfilledOnce
);

export const selectShouldInitAddressBook = (state: BeefyState, chainId: ChainEntity['id']) =>
  selectShouldInitAddressBookGlobal(state) || selectShouldInitAddressBookChain(state, chainId);

export const selectIsAddressBookLoaded = (state: BeefyState, chainId: ChainEntity['id']) =>
  selectIsAddressBookLoadedGlobal(state) || selectIsAddressBookLoadedChain(state, chainId);

export const selectShouldInitProposals = createGlobalDataSelector(
  'proposals',
  shouldLoaderLoadOnce
);

export const selectShouldInitArticles = createGlobalDataSelector('articles', shouldLoaderLoadOnce);

const selectIsZapConfigsLoaded = createGlobalDataSelector('zapConfigs', hasLoaderFulfilledOnce);
const selectIsZapSwapAggregatorsLoaded = createGlobalDataSelector(
  'zapSwapAggregators',
  hasLoaderFulfilledOnce
);
const selectIsZapAggregatorTokenSupportLoaded = createGlobalDataSelector(
  'zapAggregatorTokenSupport',
  hasLoaderFulfilledOnce
);
const selectIsZapAmmsLoaded = createGlobalDataSelector('zapAmms', hasLoaderFulfilledOnce);

export const selectIsZapLoaded = createSelector(
  selectIsZapConfigsLoaded,
  selectIsZapSwapAggregatorsLoaded,
  selectIsZapAggregatorTokenSupportLoaded,
  selectIsZapAmmsLoaded,
  (...availables) => availables.every(available => available === true)
);

export const selectShouldInitZapConfigs = createGlobalDataSelector(
  'zapConfigs',
  shouldLoaderLoadOnce
);
export const selectShouldInitZapSwapAggregators = createGlobalDataSelector(
  'zapSwapAggregators',
  shouldLoaderLoadOnce
);
export const selectShouldInitZapAggregatorTokenSupport = createGlobalDataSelector(
  'zapAggregatorTokenSupport',
  shouldLoaderLoadOnce
);
export const selectShouldInitZapAmms = createGlobalDataSelector('zapAmms', shouldLoaderLoadOnce);

export const selectIsClmHarvestsForUserChainPending = createAddressChainDataSelector(
  'clmHarvests',
  isLoaderPending
);
export const selectIsClmHarvestsForUserPending = createAddressDataSelector(
  'clmHarvests',
  isLoaderPending
);

export const selectIsWalletTimelineForUserPending = createAddressDataSelector(
  'timeline',
  isLoaderPending
);

export const selectIsWalletTimelineForUserRecent = createAddressDataSelector(
  'timeline',
  hasLoaderFulfilledRecently,
  5
);

const selectShouldInitDashboardForUserImpl = createAddressDataSelector(
  'dashboard',
  shouldLoaderLoadRecent,
  5
);

export const selectShouldInitDashboardForUser = (state: BeefyState, walletAddress: string) => {
  if (!walletAddress) {
    return false;
  }

  return (
    selectIsConfigAvailable(state) &&
    selectIsAddressBookLoadedGlobal(state) &&
    selectShouldInitDashboardForUserImpl(state, walletAddress)
  );
};

export const selectDashboardShouldLoadBalanceForChainUser = createAddressChainDataSelector(
  'balance',
  shouldLoaderLoadRecent,
  5
);

export const selectHasMerklRewardsDispatchedRecentlyForAnyUser = createGlobalDataSelector(
  'merklRewards',
  createHasLoaderDispatchedRecentlyEvaluator(15),
  5
);

export const selectFetchMerklRewardsLastDispatched = createGlobalDataSelector(
  'merklRewards',
  loader => loader?.lastDispatched || 0
);

export const selectMerklRewardsForUserShouldLoad = createAddressDataSelector(
  'merklRewards',
  createShouldLoaderLoadRecentEvaluator(30 * 60),
  5
);

export const selectMerklRewardsForUserHasFulfilledOnce = createAddressDataSelector(
  'merklRewards',
  hasLoaderFulfilledOnce
);

export const selectMerklRewardsForUserIsRejected = createAddressDataSelector(
  'merklRewards',
  isLoaderRejected
);

export const selectMerklRewardsForUserIsPending = createAddressDataSelector(
  'merklRewards',
  isLoaderPending
);

export const selectMerklUserRewardsStatus = createSelector(
  selectMerklRewardsForUserHasFulfilledOnce,
  selectMerklRewardsForUserShouldLoad,
  selectMerklRewardsForUserIsRejected,
  selectMerklRewardsForUserIsPending,
  selectHasMerklRewardsDispatchedRecentlyForAnyUser,
  (userFulfilled, userShouldLoad, userRejected, userPending, anyUserDispatchedRecently) => ({
    canLoad: userShouldLoad && !anyUserDispatchedRecently,
    isLoaded: userFulfilled,
    isLoading: userPending,
    isError: !userFulfilled && userRejected,
  })
);

export const selectHasStellaSwapRewardsDispatchedRecentlyForAnyUser = createGlobalDataSelector(
  'stellaSwapRewards',
  createHasLoaderDispatchedRecentlyEvaluator(15),
  5
);

export const selectFetchStellaSwapRewardsLastDispatched = createGlobalDataSelector(
  'stellaSwapRewards',
  loader => loader?.lastDispatched || 0
);

export const selectStellaSwapRewardsForUserShouldLoad = createAddressDataSelector(
  'stellaSwapRewards',
  createShouldLoaderLoadRecentEvaluator(30 * 60),
  5
);

export const selectStellaSwapRewardsForUserHasFulfilledOnce = createAddressDataSelector(
  'stellaSwapRewards',
  hasLoaderFulfilledOnce
);

export const selectStellaSwapRewardsForUserIsRejected = createAddressDataSelector(
  'stellaSwapRewards',
  isLoaderRejected
);

export const selectStellaSwapRewardsForUserIsPending = createAddressDataSelector(
  'stellaSwapRewards',
  isLoaderPending
);

export const selectStellaSwapUserRewardsStatus = createSelector(
  selectStellaSwapRewardsForUserHasFulfilledOnce,
  selectStellaSwapRewardsForUserShouldLoad,
  selectStellaSwapRewardsForUserIsRejected,
  selectStellaSwapRewardsForUserIsPending,
  selectHasStellaSwapRewardsDispatchedRecentlyForAnyUser,
  (userFulfilled, userShouldLoad, userRejected, userPending, anyUserDispatchedRecently) => ({
    canLoad: userShouldLoad && !anyUserDispatchedRecently,
    isLoaded: userFulfilled,
    isLoading: userPending,
    isError: !userFulfilled && userRejected,
  })
);

export const selectShouldLoadAllCurrentCowcentratedRanges = createGlobalDataSelector(
  'currentCowcentratedRanges',
  createShouldLoaderLoadRecentEvaluator(3 * 60),
  5
);

export const selectIsBalanceAvailableForChainUser = createAddressChainDataSelector(
  'balance',
  hasLoaderFulfilledOnce
);
