import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { shouldVaultShowInterest, VaultEntity } from '../entities/vault';
import { selectVaultById } from './vaults';
import { createCachedSelector } from 're-reselect';
import { isInitialLoader, isPending } from '../reducers/data-loader-types';

const selectIsPriceAvailable = (state: BeefyState) =>
  state.ui.dataLoader.global.prices.alreadyLoadedOnce;

export const selectIsConfigAvailable = (state: BeefyState) =>
  state.ui.dataLoader.global.chainConfig.alreadyLoadedOnce &&
  state.ui.dataLoader.global.vaults.alreadyLoadedOnce &&
  state.ui.dataLoader.global.boosts.alreadyLoadedOnce &&
  state.ui.dataLoader.global.platforms.alreadyLoadedOnce;

export const selectVaultApyAvailable = (state: BeefyState, vaultId: VaultEntity['id']) => {
  if (!selectIsConfigAvailable(state)) {
    return false;
  }
  const vault = selectVaultById(state, vaultId);
  const chainId = vault.chainId;

  return (
    state.ui.dataLoader.byChainId[chainId]?.contractData.alreadyLoadedOnce &&
    state.ui.dataLoader.global.apy.alreadyLoadedOnce
  );
};

/** Returns false if vault is retired or paused and not earning */
export const selectVaultShouldShowInterest = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (vault: VaultEntity) => shouldVaultShowInterest(vault)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsUserBalanceAvailable = createSelector(
  [
    selectIsConfigAvailable,
    selectIsPriceAvailable,
    (state: BeefyState) => state.ui.dataLoader.byChainId,
  ],
  (configAvailable, pricesAvailable, byChainId) => {
    if (!configAvailable || !pricesAvailable) {
      return false;
    }
    for (const chainId in byChainId) {
      // if any chain has balance data, then balance data is available
      if (
        byChainId[chainId].contractData.alreadyLoadedOnce &&
        byChainId[chainId].balance.alreadyLoadedOnce
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
  !state.ui.dataLoader.byChainId[chainId] ||
  isInitialLoader(state.ui.dataLoader.byChainId[chainId].addressBook);

export const selectIsAddressBookLoaded = (state: BeefyState, chainId: ChainEntity['id']) =>
  state.ui.dataLoader.global.addressBook.alreadyLoadedOnce ||
  state.ui.dataLoader.byChainId[chainId]?.addressBook.alreadyLoadedOnce;
