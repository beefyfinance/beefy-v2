import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';

export const selectIsPriceAvailable = createSelector(
  [(state: BeefyState) => state.ui.dataLoader.global.prices],
  (prices): boolean => {
    return prices.alreadyLoadedOnce;
  }
);

export const selectIsConfigAvailable = createSelector(
  [(state: BeefyState) => state.ui.dataLoader.global],
  (glob): boolean => {
    return (
      glob.chainConfig.alreadyLoadedOnce &&
      glob.vaults.alreadyLoadedOnce &&
      glob.boosts.alreadyLoadedOnce
    );
  }
);

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
