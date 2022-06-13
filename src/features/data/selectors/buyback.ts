import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { BIG_ZERO } from '../../../helpers/big-number';

export const selectTotalBuybackUsdAmount = createSelector(
  (state: BeefyState) => state.biz.buyback.byChainId,
  byChainId => {
    let total = BIG_ZERO;
    for (const chainId in byChainId) {
      total = total.plus(byChainId[chainId].buybackUsdAmount);
    }
    return total;
  }
);

export const selectTotalBuybackTokenAmount = createSelector(
  (state: BeefyState) => state.biz.buyback.byChainId,
  byChainId => {
    let total = BIG_ZERO;
    for (const chainId in byChainId) {
      total = total.plus(byChainId[chainId].buybackTokenAmount);
    }
    return total;
  }
);
