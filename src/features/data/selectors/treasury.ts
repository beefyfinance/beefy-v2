import BigNumber from 'bignumber.js';
import createCachedSelector from 're-reselect';
import { BIG_ZERO, isReal } from '../../../helpers/big-number';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { isVaultHoldingEntity, TreasuryHoldingEntity } from '../entities/treasury';
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

export const selectTreasurySorted = function (state: BeefyState) {
  const treasuryPerChain = Object.keys(selectTreasury(state)).map(chainId => {
    const assets = selectTreasuryAssetsByChainId(state, chainId);
    return assets
      .filter(asset => asset.usdValue.gte(10))
      .reduce(
        (acc, asset) => {
          acc.usdTotal = acc.usdTotal.plus(asset.usdValue);
          if (['token', 'native'].includes(asset.assetType)) {
            acc.liquid++;
          } else if (asset.assetType === 'vault') {
            acc.staked++;
          } else if (asset.assetType === 'validator') {
            acc.locked++;
          }
          return acc;
        },
        { usdTotal: BIG_ZERO, liquid: 0, staked: 0, locked: 0, chainId }
      );
  });

  return treasuryPerChain.sort((a, b) => b.usdTotal.comparedTo(a.usdTotal));
};

export const selectTreasuryHoldingsByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  return state.ui.treasury.byChainId[chainId];
};

export const selectTreasuryBalanceByChainId = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id']) =>
    selectTreasuryHoldingsByChainId(state, chainId),
  treasuryByChainId => {
    return Object.values(treasuryByChainId).reduce((totals, address) => {
      for (const token of Object.values(address.balances)) {
        if (isReal(token.usdValue)) {
          totals = totals.plus(token.usdValue);
        }
      }

      return totals;
    }, BIG_ZERO);
  }
)((state: BeefyState, chainId: ChainEntity['id']) => chainId);

export const selectTreasuryAssetsByChainId = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id']) =>
    selectTreasuryHoldingsByChainId(state, chainId),

  treasuryByChainId => {
    const vaults: Record<string, TreasuryHoldingEntity> = {};
    for (const address of Object.values(treasuryByChainId)) {
      for (const token of Object.values(address.balances)) {
        if (!isReal(token.usdValue)) continue;

        vaults[token.address] = {
          ...token,
          usdValue: (vaults[token.address]?.usdValue || BIG_ZERO).plus(token.usdValue),
          balance: (vaults[token.address]?.balance || BIG_ZERO).plus(token.balance),
        };
      }
    }

    return Object.values(vaults);
  }
)((state: BeefyState, chainId: ChainEntity['id']) => chainId);

export const selectTreasuryStats = (state: BeefyState) => {
  const treasury = selectTreasury(state);
  let holdings = BIG_ZERO;
  let assets = [];
  let beefyHeld = BIG_ZERO;
  let stables = BIG_ZERO;
  for (const [chainId, balances] of Object.entries(treasury)) {
    for (const balancePerChain of Object.values(balances)) {
      for (const token of Object.values(balancePerChain.balances)) {
        if (token) {
          const balanceInTokens = token.balance.shiftedBy(-token.decimals);
          if (token.oracleId === 'BIFI') {
            beefyHeld = beefyHeld.plus(balanceInTokens);
          }
          if (isReal(token.usdValue)) {
            const tokenUsdValue = token.usdValue;
            holdings = holdings.plus(tokenUsdValue);
            if (isVaultHoldingEntity(token) && selectIsVaultStable(state, token.vaultId)) {
              stables = stables.plus(tokenUsdValue);
            } else if (selectIsTokenStable(state, chainId, token.oracleId)) {
              stables = stables.plus(tokenUsdValue);
            }
          }
          assets.push(token.name);
        }
      }
    }
  }

  return { holdings, assets: new Set(assets).size, beefyHeld, stables };
};

export const selectTreasuryTokensExposure = (state: BeefyState) => {
  const treasury = selectTreasury(state);
  const exposure = Object.entries(treasury).reduce((totals, [chainId, wallets]) => {
    for (const wallet of Object.values(wallets)) {
      for (const token of Object.values(wallet.balances)) {
        if (isReal(token.usdValue)) {
          const tokenBalanceUsd = token.usdValue;
          if (token.oracleType === 'lps') {
            if (isVaultHoldingEntity(token) && selectIsVaultStable(state, token.vaultId)) {
              totals['stables'] = (totals['stables'] || BIG_ZERO).plus(tokenBalanceUsd);
            } else {
              const haveBreakdownData = selectHasBreakdownData(state, token.address, chainId);
              if (haveBreakdownData) {
                let balance = token.balance.shiftedBy(-token.decimals);
                if (isVaultHoldingEntity(token)) {
                  const ppfs = token.pricePerFullShare.shiftedBy(-18); // ppfs always need to be shifted by 18e
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
