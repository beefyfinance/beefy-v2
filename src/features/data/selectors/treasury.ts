import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import createCachedSelector from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { isInitialLoader } from '../reducers/data-loader-types';

export const selectIsTreasuryLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.treasury.alreadyLoadedOnce;

export const selectShouldInitTreasury = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.treasury);

export const selectTreasury = (state: BeefyState) => {
  return state.ui.treasury.byChainId;
};

export const selectTreasuryHoldingsByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  return state.ui.treasury.byChainId[chainId];
};

export const selectTreasurySummaryByChainId = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id']) =>
    selectTreasuryHoldingsByChainId(state, chainId),
  treasuryByChainId => {
    return Object.values(treasuryByChainId).reduce(
      (totals, item) => {
        for (const token of Object.values(item.balances)) {
          if (!token.usdValue.includes('NaN')) {
            totals.totalUsd = totals.totalUsd.plus(new BigNumber(token.usdValue));
          }
          if (token.assetType === ('token' || 'native')) {
            totals.liquidAssets.push(token);
          }
          if (token.assetType === 'vault') {
            totals.stakedAssets.push(token);
          }
        }
        return totals;
      },
      { totalUsd: BIG_ZERO, stakedAssets: [], liquidAssets: [] } as {
        totalUsd: BigNumber;
        stakedAssets: any[];
        liquidAssets: any[];
      }
    );
  }
)((state: BeefyState, chainId: ChainEntity['id']) => chainId);

export const selectTreasuryStats = createSelector(
  (state: BeefyState) => state.ui.treasury.byChainId,
  treasury => {
    let holdings = BIG_ZERO;
    let assets = [];
    let beefyHeld = BIG_ZERO;

    for (const [, balances] of Object.entries(treasury)) {
      for (const balancePerChain of Object.values(balances)) {
        for (const token of Object.values(balancePerChain.balances)) {
          if (token) {
            const balanceInTokens = new BigNumber(token.balance).shiftedBy(-token.decimals);
            if (token.symbol === 'BIFI') {
              beefyHeld = beefyHeld.plus(balanceInTokens);
            }
            if (!token.usdValue.includes('NaN')) {
              holdings = holdings.plus(new BigNumber(token.usdValue));
            }
            assets.push(token.symbol || token.name);
          }
        }
      }
    }

    return { holdings, assets: new Set(assets).size, beefyHeld };
  }
);
