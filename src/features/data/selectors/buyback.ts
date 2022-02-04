import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BeefyState } from '../../../redux-types';

export const selectTotalBuybackUsdAmount = createSelector(
  (state: BeefyState) => state.biz.buyback.byChainId,
  byChainId => {
    let total = new BigNumber(0);
    for (const chainId in byChainId) {
      total = total.plus(byChainId[chainId].buybackUsdAmount);
    }
    return total;
  }
);

export const selectTotalBuybackTokenAmount = createSelector(
  (state: BeefyState) => state.biz.buyback.byChainId,
  byChainId => {
    let total = new BigNumber(0);
    for (const chainId in byChainId) {
      total = total.plus(byChainId[chainId].buybackTokenAmount);
    }
    return total;
  }
);
