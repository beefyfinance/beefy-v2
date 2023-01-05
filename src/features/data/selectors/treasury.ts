import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { sortBy } from 'lodash';
import createCachedSelector from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { isTreasuryHoldingVault, TreasuryHoldingsInterface } from '../entities/treasury';
import { isInitialLoader } from '../reducers/data-loader-types';
import { getTopNArray } from '../utils/array-utils';
import { selectLpBreakdownBalance } from './balance';
import { selectHasBreakdownData, selectIsTokenStable, selectLpBreakdownByAddress } from './tokens';
import { selectIsVaultStable } from './vaults';

export const selectIsTreasuryLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.treasury.alreadyLoadedOnce;

export const selectShouldInitTreasury = (state: BeefyState) =>
  isInitialLoader(state.ui.dataLoader.global.treasury);

export const selectTreasury = (state: BeefyState) => {
  return state.ui.treasury.byChainId;
};

export const selectTreasurySorted = createSelector(selectTreasury, treasury => {
  const values = Object.entries(treasury).reduce((totals, [chainId, addresses]) => {
    for (const address of Object.values(addresses)) {
      for (const token of Object.values(address.balances)) {
        if (!token.usdValue.includes('NaN')) {
          totals[chainId] = (totals[chainId] || BIG_ZERO).plus(new BigNumber(token.usdValue));
        }
      }
    }
    return totals;
  }, {} as Record<ChainEntity['id'], BigNumber>);
  const list = [];
  for (const [chainId, balance] of Object.entries(values)) {
    list.push({ balance: balance.toNumber(), chainId });
  }
  const sortedArray = sortBy(list, ['balance']).reverse();
  return sortedArray;
});

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
          totals.assets.push(token);
        }
        return totals;
      },
      { totalUsd: BIG_ZERO, assets: [] } as {
        totalUsd: BigNumber;
        assets: TreasuryHoldingsInterface[];
      }
    );
  }
)((state: BeefyState, chainId: ChainEntity['id']) => chainId);


export const selectTreasuryStats = createSelector(selectTreasury, treasury => {
  let holdings = BIG_ZERO;
  let assets = [];
  let beefyHeld = BIG_ZERO;
  for (const [, balances] of Object.entries(treasury)) {
    for (const balancePerChain of Object.values(balances)) {
      for (const token of Object.values(balancePerChain.balances)) {
        if (token) {
          const balanceInTokens = new BigNumber(token.balance).shiftedBy(-token.decimals);
          if (token.oracleId === 'BIFI') {
            beefyHeld = beefyHeld.plus(balanceInTokens);
          }
          if (!token.usdValue.includes('NaN')) {
            holdings = holdings.plus(new BigNumber(token.usdValue));
          }
          assets.push(token.name);
        }
      }
    }
  }

  return { holdings, assets: new Set(assets).size, beefyHeld };
});

export const selectTreasuryTokensExposure = (state: BeefyState) => {
  const treasury = selectTreasury(state);
  const exposure = Object.entries(treasury).reduce((totals, [chainId, wallets]) => {
    for (const wallet of Object.values(wallets)) {
      for (const token of Object.values(wallet.balances)) {
        if (!token.usdValue.includes('NaN')) {
          const tokenBalanceUsd = new BigNumber(token.usdValue);
          if (token.oracleType === 'lps') {
            if (isTreasuryHoldingVault(token) && selectIsVaultStable(state, token.vaultId)) {
              totals['stables'] = (totals['stables'] || BIG_ZERO).plus(tokenBalanceUsd);
            } else {
              const haveBreakdownData = selectHasBreakdownData(state, token.address, chainId);
              if (haveBreakdownData) {
                let balance = new BigNumber(token.balance).shiftedBy(-token.decimals);
                if (isTreasuryHoldingVault(token)) {
                  const ppfs = new BigNumber(token.pricePerFullShare).shiftedBy(-18); // ppfs always need to be shifted by 18e
                  balance = balance.multipliedBy(ppfs);
                }
                const breakdown = selectLpBreakdownByAddress(state, chainId, token.address);
                const { assets } = selectLpBreakdownBalance(state, breakdown, balance, chainId);
                for (const asset of assets) {
                  if (selectIsTokenStable(state, chainId, asset.id)) {
                    totals['stables'] = (totals['stables'] || BIG_ZERO).plus(asset.userValue);
                  } else {
                    totals[asset.id] = (totals[asset.id] || BIG_ZERO).plus(asset.userValue);
                  }
                }
              } else {
                totals[token.oracleId] = tokenBalanceUsd;
              }
            }
          } else {
            if (selectIsTokenStable(state, chainId, token.oracleId)) {
              totals['stables'] = (totals['stables'] || BIG_ZERO).plus(tokenBalanceUsd);
            } else {
              totals[token.oracleId] = (totals[token.oracleId] || BIG_ZERO).plus(tokenBalanceUsd);
            }
          }
        }
      }
    }
    return totals;
  }, {} as Record<string, BigNumber>);

  const treasuryValue = Object.keys(exposure).reduce(
    (cur, tot) => exposure[tot].plus(cur),
    BIG_ZERO
  );

  const treasuryExposure = Object.keys(exposure).map(key => {
    return {
      key,
      value: exposure[key],
      percentage: exposure[key].dividedBy(treasuryValue).toNumber(),
    };
  });

  return getTopNArray(treasuryExposure, 'percentage');
};
