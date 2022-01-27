import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { isPending } from '../reducers/data-loader';
import { selectVaultById } from './vaults';

export const selectIsPriceLoading = createSelector(
  [
    (state: BeefyState) => state.ui.dataLoader.global.prices,
    (state: BeefyState) => state.ui.dataLoader.global.lpPrices,
  ],
  (prices, lpPrices): boolean => {
    return isPending(prices) || isPending(lpPrices);
  }
);

export const selectIsConfigLoading = createSelector(
  [
    (state: BeefyState) => state.ui.dataLoader.global,
    (state: BeefyState) => state.ui.dataLoader.byChainId,
  ],
  (glob, byChainId): boolean => {
    return (
      isPending(glob.chainConfig) ||
      Object.keys(byChainId).some(
        chainId =>
          isPending(byChainId[chainId].vaultConfig) || isPending(byChainId[chainId].boostConfig)
      )
    );
  }
);

export const selectIsChainLoading = createSelector(
  [
    selectIsConfigLoading,
    // it's weird but this is how reselect defines params
    (state: BeefyState, chainId: ChainEntity['id']) => state.ui.dataLoader.byChainId[chainId],
  ],
  (configLoading, chainLoadingDetails): boolean => {
    return (
      configLoading ||
      isPending(chainLoadingDetails.standardVaultContractData) ||
      isPending(chainLoadingDetails.govVaultContractData) ||
      isPending(chainLoadingDetails.boostContractData)
    );
  }
);

export const selectIsVaultLoading = createSelector(
  [
    selectIsConfigLoading,
    selectIsPriceLoading,
    (state: BeefyState, vaultId: VaultEntity['id']) => {
      const vault = selectVaultById(state, vaultId);
      return selectIsChainLoading(state, vault.chainId);
    },
  ],
  (configLoading, pricesLoading, vaultChainLoading) => {
    return configLoading || pricesLoading || vaultChainLoading;
  }
);
