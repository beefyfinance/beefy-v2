import BigNumber from 'bignumber.js';
import { createCachedSelector } from 're-reselect';
import { BIG_ZERO, isFiniteBigNumber } from '../../../helpers/big-number';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import type { TokenHoldingEntity, TreasuryHoldingEntity } from '../entities/treasury';
import { isTokenHoldingEntity, isVaultHoldingEntity } from '../entities/treasury';
import { isInitialLoader } from '../reducers/data-loader-types';
import { selectLpBreakdownBalance } from './balance';
import { selectChainById } from './chains';
import {
  selectIsTokenStable,
  selectLpBreakdownByOracleId,
  selectHasBreakdownDataByOracleId,
  selectWrappedToNativeSymbolOrTokenSymbol,
} from './tokens';
import { selectIsVaultStable, selectVaultById, selectVaultPricePerFullShare } from './vaults';
import { explorerAddressUrl } from '../../../helpers/url';

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
          if (['token', 'native'].includes(asset.assetType) && !asset.staked) {
            acc.liquid++;
          } else if (asset.staked) {
            acc.staked++;
          } else if (asset.assetType === 'validator') {
            acc.locked++;
          }
          return acc;
        },
        { usdTotal: BIG_ZERO, liquid: 0, staked: 0, locked: 0, chainId }
      );
  });

  return treasuryPerChain
    .filter(chain => chain.liquid + chain.staked + chain.locked > 0)
    .sort((a, b) => b.usdTotal.comparedTo(a.usdTotal));
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
        if (isFiniteBigNumber(token.usdValue)) {
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
        if (!isFiniteBigNumber(token.usdValue)) continue;

        const key = token.assetType === 'validator' ? 'validator' : token.address;

        vaults[key] = {
          ...token,
          usdValue: (vaults[key]?.usdValue || BIG_ZERO).plus(token.usdValue),
          balance: (vaults[key]?.balance || BIG_ZERO).plus(token.balance),
        };
      }
    }

    return Object.values(vaults);
  }
)((state: BeefyState, chainId: ChainEntity['id']) => chainId);

const bifiOracles = ['BIFI', 'mooBIFI', 'rBIFI'];

export const selectTreasuryStats = (state: BeefyState) => {
  const treasury = selectTreasury(state);
  let holdings = BIG_ZERO;
  const holdingAssets = new Set();
  let beefyHeld = BIG_ZERO;
  let stables = BIG_ZERO;
  for (const [chainId, balances] of Object.entries(treasury)) {
    for (const balancePerChain of Object.values(balances)) {
      for (const token of Object.values(balancePerChain.balances)) {
        if (token) {
          let balanceInTokens = token.balance.shiftedBy(-token.decimals);
          if (bifiOracles.includes(token.oracleId)) {
            beefyHeld = getBifiBalanceInTokens(state, token.oracleId, beefyHeld, balanceInTokens);
          }

          if (token.oracleType === 'lps') {
            const haveBreakdownData = selectHasBreakdownDataByOracleId(
              state,
              token.oracleId,
              chainId
            );

            if (haveBreakdownData) {
              if (isVaultHoldingEntity(token)) {
                const ppfs = token.pricePerFullShare.shiftedBy(-18); // ppfs always need to be shifted by 18e
                balanceInTokens = balanceInTokens.multipliedBy(ppfs);
              }
              const breakdown = selectLpBreakdownByOracleId(state, token.oracleId);
              const { assets } = selectLpBreakdownBalance(
                state,
                breakdown,
                balanceInTokens,
                chainId
              );
              for (const asset of assets) {
                if (bifiOracles.includes(asset.oracleId)) {
                  beefyHeld = getBifiBalanceInTokens(
                    state,
                    asset.oracleId,
                    beefyHeld,
                    asset.userAmount
                  );
                }
                if (selectIsTokenStable(state, chainId, asset.oracleId)) {
                  stables = stables.plus(asset.userValue);
                }
                if (asset.userValue.gt(100)) {
                  const symbol = selectWrappedToNativeSymbolOrTokenSymbol(state, asset.symbol);
                  holdingAssets.add(symbol);
                }
              }
            }

            if (isVaultHoldingEntity(token)) {
              if (token.usdValue.gt(10)) {
                const vault = selectVaultById(state, token.vaultId);

                for (const assetId of vault.assetIds) {
                  const symbol = selectWrappedToNativeSymbolOrTokenSymbol(state, assetId);
                  holdingAssets.add(symbol);
                }
              }

              if (selectIsVaultStable(state, token.vaultId)) {
                stables = stables.plus(token.usdValue);
              }
            }
          }

          if (isFiniteBigNumber(token.usdValue)) {
            if (selectIsTokenStable(state, chainId, token.oracleId)) {
              stables = stables.plus(token.usdValue);
            }

            if (isTokenHoldingEntity(token) && token.usdValue.gt(10)) {
              const symbol = token.symbol
                ? selectWrappedToNativeSymbolOrTokenSymbol(state, token.symbol)
                : token.name;
              holdingAssets.add(symbol);
            }
          }

          if (isFiniteBigNumber(token.usdValue)) {
            holdings = holdings.plus(token.usdValue);
          }
        }
      }
    }
  }

  return { holdings, assets: holdingAssets.size, beefyHeld, stables };
};

/**
 * Helper function to get bifi balance
 * @param state
 * @param token
 * @param beefyHeld
 * @param balance
 * @returns Balance in Tokens
 */
const getBifiBalanceInTokens = (
  state: BeefyState,
  oracleId: TreasuryHoldingEntity['oracleId'],
  beefyHeld: BigNumber,
  balance: BigNumber
): BigNumber => {
  if (oracleId === 'BIFI' || oracleId === 'rBIFI') {
    return beefyHeld.plus(balance);
  } else {
    const moobifiPpfs = selectVaultPricePerFullShare(state, 'bifi-vault');
    return beefyHeld.plus(balance.times(moobifiPpfs));
  }
};

export const selectTreasuryTokensExposure = (state: BeefyState) => {
  const treasury = selectTreasury(state);
  const exposure = Object.entries(treasury).reduce((totals, [chainId, wallets]) => {
    for (const wallet of Object.values(wallets)) {
      for (const token of Object.values(wallet.balances)) {
        if (isFiniteBigNumber(token.usdValue)) {
          const tokenBalanceUsd = token.usdValue;
          if (token.oracleType === 'lps') {
            if (isVaultHoldingEntity(token) && selectIsVaultStable(state, token.vaultId)) {
              totals['stables'] = (totals['stables'] || BIG_ZERO).plus(tokenBalanceUsd);
            } else {
              const haveBreakdownData = selectHasBreakdownDataByOracleId(
                state,
                token.oracleId,
                chainId
              );
              if (haveBreakdownData) {
                let balance = token.balance.shiftedBy(-token.decimals);
                if (isVaultHoldingEntity(token)) {
                  const ppfs = token.pricePerFullShare.shiftedBy(-18); // ppfs always need to be shifted by 18e
                  balance = balance.multipliedBy(ppfs);
                }
                const breakdown = selectLpBreakdownByOracleId(state, token.oracleId);
                const { assets } = selectLpBreakdownBalance(state, breakdown, balance, chainId);
                for (const asset of assets) {
                  if (selectIsTokenStable(state, chainId, asset.id)) {
                    totals['stables'] = (totals['stables'] || BIG_ZERO).plus(asset.userValue);
                  } else {
                    const assetId = selectWrappedToNativeSymbolOrTokenSymbol(state, asset.symbol);
                    totals[assetId] = (totals[assetId] || BIG_ZERO).plus(asset.userValue);
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
              const assetId = token.symbol
                ? selectWrappedToNativeSymbolOrTokenSymbol(state, token.symbol)
                : token.name;
              totals[assetId] = (totals[assetId] || BIG_ZERO).plus(tokenBalanceUsd);
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

  return treasuryExposure;
};

export const selectTreasuryExposureByChain = (state: BeefyState) => {
  const treasury = selectTreasury(state);

  const chains: Record<string, BigNumber> = {};

  for (const chainId of Object.keys(treasury)) {
    const totalUsdPerChain = selectTreasuryBalanceByChainId(state, chainId);
    chains[chainId] = totalUsdPerChain;
  }

  const totalTreasury = Object.keys(chains).reduce((cur, tot) => chains[tot].plus(cur), BIG_ZERO);

  const treasuryExposureBychain = Object.keys(chains).map(chainId => {
    const chain = selectChainById(state, chainId);
    return {
      key: chainId,
      value: chains[chainId],
      percentage: chains[chainId].dividedBy(totalTreasury).toNumber(),
      label: chain.name,
    };
  });

  return treasuryExposureBychain;
};

export const selectTreasuryExposureByAvailability = (state: BeefyState) => {
  const treasury = selectTreasury(state);

  const exposure = Object.keys(treasury).reduce((totals, chainId) => {
    const assetsByChainId = selectTreasuryAssetsByChainId(state, chainId);

    for (const token of assetsByChainId) {
      if (isFiniteBigNumber(token.usdValue)) {
        const usdValue = new BigNumber(token.usdValue);
        if (['token', 'native'].includes(token.assetType) && !token.staked) {
          totals['liquidAssets'] = (totals['liquidAssets'] || BIG_ZERO).plus(usdValue);
        }
        if (token.staked) {
          totals['stakedAssets'] = (totals['stakedAssets'] || BIG_ZERO).plus(usdValue);
        }
        if (token.assetType === 'validator') {
          totals['lockedAssets'] = (totals['lockedAssets'] || BIG_ZERO).plus(usdValue);
        }
      }
    }
    return totals;
  }, {} as Record<string, BigNumber>);

  const totalTreasury = Object.keys(exposure).reduce(
    (cur, tot) => exposure[tot].plus(cur),
    BIG_ZERO
  );

  const treasuryExposureByAvailability = Object.keys(exposure).map(key => {
    return {
      key: key,
      value: exposure[key],
      percentage: exposure[key].dividedBy(totalTreasury).toNumber(),
    };
  });

  return treasuryExposureByAvailability;
};

export const selectTreasuryWalletAddressesByChainId = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id']) =>
    selectTreasuryHoldingsByChainId(state, chainId),
  (state: BeefyState, chainId: ChainEntity['id']) => selectChainById(state, chainId),

  (treasury, chain) => {
    return Object.values(treasury).map(wallet => {
      if (wallet.name.includes('validator')) {
        if (chain.id === 'ethereum') {
          const allValidatorsIds = Object.values(wallet.balances).map(
            (validator: TokenHoldingEntity) => validator.numberId
          );
          return {
            address: wallet.address,
            name: 'validators',
            url: 'https://beaconcha.in/dashboard?validators=' + allValidatorsIds.join(','),
          };
        }
        return {
          address: wallet.address,
          name: 'validator',
          url: explorerAddressUrl(chain, Object.values(wallet.balances)[0].methodPath),
        };
      }
      return {
        address: wallet.address,
        name: wallet.name,
        url: explorerAddressUrl(chain, wallet.address),
      };
    });
  }
)((state: BeefyState, chainId: ChainEntity['id']) => chainId);
