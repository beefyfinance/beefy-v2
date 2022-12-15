import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number';
import { BeefyState } from '../../../redux-types';
import { isInitialLoader } from '../reducers/data-loader-types';

export const selectIsTreasuryLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.treasury.alreadyLoadedOnce;

export const selectShouldInitTreasury = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.treasury);

export const selectTreasuryStats = createSelector(
  (state: BeefyState) => state.ui.treasury.byChainId,
  treasury => {
    let holdings = BIG_ZERO;
    let assets = [];
    let beefyHeld = BIG_ZERO;

    for (const [, balances] of Object.entries(treasury)) {
      for (const balancePerChain of Object.values(balances)) {
        for (const item of Object.values(balancePerChain?.balances)) {
          if (item) {
            const balanceInTokens = new BigNumber(item.balance).shiftedBy(-item.decimals);
            if (item.symbol === 'BIFI') {
              beefyHeld = beefyHeld.plus(balanceInTokens);
            }
            if (!item.usdValue.includes('e-') && !item.usdValue.includes('NaN')) {
              holdings = holdings.plus(new BigNumber(item.usdValue));
            }
            assets.push(item.symbol || item.name);
          }
        }
      }
    }

    const totalAssets = new Set(assets);

    return { holdings, assets: totalAssets.size, beefyHeld };
  }
);
