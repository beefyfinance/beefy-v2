import { createSelector } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { isPending } from '../reducers/data-loader';
import { BeefyState } from '../state';

export const isVaultLoadingSelector = createSelector(
  (store: BeefyState) => store.entities.vaults.byId, // could be reused
  (store: BeefyState) => store.ui.dataLoader.pricesLoading,
  (_: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (vaultsByIds, pricesLoading, vaultId) => {
    // find out if vault is here
    if (vaultsByIds[vaultId]) {
      return true;
    } else {
      // or find out if price query is pending
      return isPending(pricesLoading);
    }
  }
);

export const isChainLoadingSelector = createSelector(
  [
    // it's weird but this is how reselect defines params
    (_: BeefyState, chainId: ChainEntity['id']) => chainId,
  ],
  (chainId): boolean => {
    // todo
    return true;
  }
);

export const isPricesLoadingSelector = createSelector(
  [(state: BeefyState) => state.ui.dataLoader.pricesLoading],
  (pricesLoading): boolean => {
    return isPending(pricesLoading);
  }
);
