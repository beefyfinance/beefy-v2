import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { VaultEntity } from '../entities/vault';
import { isPending } from '../reducers/data-loader';
import { selectVaultById } from './vaults';

const selectIsPriceAvailable = (state: BeefyState) =>
  state.ui.dataLoader.global.prices.alreadyLoadedOnce;

export const selectIsConfigAvailable = (state: BeefyState) =>
  state.ui.dataLoader.global.chainConfig.alreadyLoadedOnce &&
  state.ui.dataLoader.global.vaults.alreadyLoadedOnce &&
  state.ui.dataLoader.global.boosts.alreadyLoadedOnce;

export const selectVaultApyAvailable = (state: BeefyState, vaultId: VaultEntity['id']) => {
  if (!selectIsConfigAvailable(state)) {
    return false;
  }
  const vault = selectVaultById(state, vaultId);
  const chainId = vault.chainId;

  return state.ui.dataLoader.byChainId[chainId]?.contractData.alreadyLoadedOnce;
};

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
