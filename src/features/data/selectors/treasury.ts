import BigNumber from 'bignumber.js';
import { createCachedSelector } from 're-reselect';
import { BIG_ZERO, compareBigNumber, isFiniteBigNumber } from '../../../helpers/big-number.ts';
import { entries, keys } from '../../../helpers/object.ts';
import { explorerAddressUrl } from '../../../helpers/url.ts';
import type { ChainEntity, ChainId } from '../entities/chain.ts';
import type { TokenHoldingEntity, TreasuryHoldingEntity } from '../entities/treasury.ts';
import { isTokenHoldingEntity, isVaultHoldingEntity } from '../entities/treasury.ts';
import type { BeefyState } from '../store/types.ts';
import { selectLpBreakdownBalance } from './balance.ts';
import { selectChainById } from './chains.ts';
import {
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  shouldLoaderLoadOnce,
} from './data-loader-helpers.ts';
import { selectIsVaultStable } from './filtered-vaults.ts';
import {
  selectHasBreakdownDataByOracleId,
  selectIsTokenStable,
  selectLpBreakdownByOracleId,
  selectVaultTokenSymbols,
  selectWrappedToNativeSymbolOrTokenSymbol,
} from './tokens.ts';
import { selectVaultPricePerFullShare } from './vaults.ts';

export const selectIsTreasuryLoaded = createGlobalDataSelector('treasury', hasLoaderFulfilledOnce);

export const selectShouldInitTreasury = createGlobalDataSelector('treasury', shouldLoaderLoadOnce);

export const selectTreasury = (state: BeefyState) => {
  return state.ui.treasury.byChainId;
};

export const selectMMAssets = (state: BeefyState) => {
  return state.ui.treasury.byMarketMakerId;
};

export const selectTreasurySorted = function (state: BeefyState) {
  const treasuryPerChain = keys(selectTreasury(state)).map(chainId => {
    const assets = selectTreasuryAssetsByChainId(state, chainId);
    const reducedAssets = assets
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
    return {
      usdTotal: reducedAssets.usdTotal,
      categoryCount:
        (reducedAssets.liquid > 0 ? 1 : 0) +
        (reducedAssets.staked > 0 ? 1 : 0) +
        (reducedAssets.locked > 0 ? 1 : 0),
      assetCount: reducedAssets.liquid + reducedAssets.staked + reducedAssets.locked,
      type: 'chain' as const,
      id: chainId,
    };
  });

  const treasuryPerMM = Object.keys(selectMMAssets(state)).map(mmId => {
    const mmHoldings = selectTreasuryHoldingsByMMId(state, mmId);
    let exchanges = 0;
    let assetCount = 0;
    let usdTotal = BIG_ZERO;
    Object.entries(mmHoldings).forEach(([_, exchangeAssets]) => {
      const filteredAssets = Object.values(exchangeAssets).filter(asset => asset.usdValue.gte(10));
      if (filteredAssets.length > 0) {
        filteredAssets.forEach(asset => {
          usdTotal = usdTotal.plus(asset.usdValue);
        });
        exchanges++;
        assetCount += filteredAssets.length;
      }
    });
    return {
      usdTotal,
      categoryCount: exchanges,
      assetCount,
      type: 'mm' as const,
      id: mmId,
    };
  });

  return [...treasuryPerChain, ...treasuryPerMM]
    .filter(chain => chain.categoryCount > 0)
    .sort((a, b) => compareBigNumber(b.usdTotal, a.usdTotal));
};

export const selectTreasuryHoldingsByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  return state.ui.treasury.byChainId[chainId];
};

export const selectTreasuryHoldingsByMMId = (state: BeefyState, mmId: string) => {
  return state.ui.treasury.byMarketMakerId[mmId];
};

export const selectTreasuryBalanceByChainId = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id']) =>
    selectTreasuryHoldingsByChainId(state, chainId),
  treasuryByChainId => {
    if (!treasuryByChainId) return BIG_ZERO;

    return Object.values(treasuryByChainId).reduce((totals, address) => {
      for (const token of Object.values(address.balances)) {
        if (isFiniteBigNumber(token.usdValue)) {
          totals = totals.plus(token.usdValue);
        }
      }
      return totals;
    }, BIG_ZERO);
  }
)((_state: BeefyState, chainId: ChainEntity['id']) => chainId);

export const selectTreasuryBalanceByMMId = createCachedSelector(
  (state: BeefyState, mmId: string) => selectTreasuryHoldingsByMMId(state, mmId),
  treasuryByMMId => {
    return Object.values(treasuryByMMId).reduce((totals, tokens) => {
      for (const token of Object.values(tokens)) {
        if (isFiniteBigNumber(token.usdValue)) {
          totals = totals.plus(token.usdValue);
        }
      }

      return totals;
    }, BIG_ZERO);
  }
)((_state: BeefyState, mmId: string) => mmId);

export const selectTreasuryAssetsByChainId = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id']) =>
    selectTreasuryHoldingsByChainId(state, chainId),

  treasuryByChainId => {
    if (!treasuryByChainId) {
      return [];
    }

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
)((_state: BeefyState, chainId: ChainEntity['id']) => chainId);

const bifiOracles = ['BIFI', 'mooBIFI', 'rBIFI'];

export const selectTreasuryStats = (state: BeefyState) => {
  const treasury = selectTreasury(state);
  const marketMakerHoldings = selectMMAssets(state);
  let holdings = BIG_ZERO;
  const holdingAssets = new Set();
  let beefyHeld = BIG_ZERO;
  let stables = BIG_ZERO;

  for (const [chainId, balances] of entries(treasury)) {
    if (balances === undefined) continue;
    for (const balancePerChain of Object.values(balances)) {
      for (const token of Object.values(balancePerChain.balances)) {
        if (token) {
          let balanceInTokens = token.balance.shiftedBy(-token.decimals);
          if (bifiOracles.includes(token.oracleId)) {
            beefyHeld = beefyHeld.plus(
              getBifiBalanceInTokens(state, token.oracleId, balanceInTokens)
            );
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
                  beefyHeld = beefyHeld.plus(
                    getBifiBalanceInTokens(state, asset.oracleId, asset.userAmount)
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
                const { vaultId } = token;

                const vaultTokenSymbols = selectVaultTokenSymbols(state, vaultId);

                for (const tokenSymbol of vaultTokenSymbols) {
                  const symbol = selectWrappedToNativeSymbolOrTokenSymbol(state, tokenSymbol);
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
              const symbol =
                token.symbol ?
                  selectWrappedToNativeSymbolOrTokenSymbol(state, token.symbol)
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

  for (const exchangeData of Object.values(marketMakerHoldings)) {
    for (const exchangeHoldings of Object.values(exchangeData)) {
      for (const holding of Object.values(exchangeHoldings)) {
        if (holding) {
          if (isFiniteBigNumber(holding.usdValue)) {
            if (holding.oracleId === 'BIFI') {
              beefyHeld = beefyHeld.plus(holding.balance);
            }
            if (selectIsTokenStable(state, 'ethereum', holding.oracleId)) {
              stables = stables.plus(holding.usdValue);
            }
            holdings = holdings.plus(holding.usdValue);
            holdingAssets.add(holding.symbol);
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
  balance: BigNumber
): BigNumber => {
  if (oracleId === 'BIFI' || oracleId === 'rBIFI') {
    return balance;
  } else {
    const moobifiPpfs = selectVaultPricePerFullShare(state, 'bifi-vault');
    return balance.times(moobifiPpfs);
  }
};

export const selectTreasuryTokensExposure = (state: BeefyState) => {
  const treasury = selectTreasury(state);
  const mmHoldings = selectMMAssets(state);

  const exposure = entries(treasury).reduce(
    (totals, [chainId, wallets]) => {
      if (wallets === undefined) return totals;

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
                const assetId =
                  token.symbol ?
                    selectWrappedToNativeSymbolOrTokenSymbol(state, token.symbol)
                  : token.name;
                totals[assetId] = (totals[assetId] || BIG_ZERO).plus(tokenBalanceUsd);
              }
            }
          }
        }
      }
      return totals;
    },
    {} as Record<string, BigNumber>
  );

  Object.values(mmHoldings).forEach(mmData => {
    Object.values(mmData).forEach(exchange => {
      Object.values(exchange).forEach(holding => {
        if (isFiniteBigNumber(holding.usdValue)) {
          if (selectIsTokenStable(state, 'ethereum', holding.oracleId)) {
            exposure['stables'] = (exposure['stables'] || BIG_ZERO).plus(holding.usdValue);
          } else {
            const assetId =
              holding.symbol ?
                selectWrappedToNativeSymbolOrTokenSymbol(state, holding.symbol)
              : holding.name;
            exposure[assetId] = (exposure[assetId] || BIG_ZERO).plus(holding.usdValue);
          }
        }
      });
    });
  });

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
  const mmHoldings = selectMMAssets(state);

  const chains: Partial<Record<ChainId, BigNumber>> = {};

  for (const chainId of keys(treasury)) {
    const totalUsdPerChain = selectTreasuryBalanceByChainId(state, chainId);
    chains[chainId] = totalUsdPerChain;
  }

  for (const mmId of Object.keys(mmHoldings)) {
    const totalUsdPerMM = selectTreasuryBalanceByMMId(state, mmId);
    chains['ethereum'] = (chains.ethereum || BIG_ZERO).plus(totalUsdPerMM);
  }

  const totalTreasury = keys(chains).reduce(
    (cur, chainId) => (chains[chainId] || BIG_ZERO).plus(cur),
    BIG_ZERO
  );

  const treasuryExposureBychain = keys(chains).map(chainId => {
    const chain = selectChainById(state, chainId);
    return {
      key: chain.id,
      value: chains[chainId]!,
      percentage: chains[chainId]!.dividedBy(totalTreasury).toNumber(),
      label: chain.name,
    };
  });

  return treasuryExposureBychain;
};

export const selectTreasuryExposureByAvailability = (state: BeefyState) => {
  const treasury = selectTreasury(state);
  const mmHoldings = selectMMAssets(state);

  const exposure = keys(treasury).reduce(
    (totals, chainId) => {
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
    },
    {} as Record<string, BigNumber>
  );

  const totalMM = Object.keys(mmHoldings).reduce((totals, mmId) => {
    return totals.plus(selectTreasuryBalanceByMMId(state, mmId));
  }, BIG_ZERO);

  const totalTreasury = Object.keys(exposure)
    .reduce((cur, tot) => exposure[tot].plus(cur), BIG_ZERO)
    .plus(totalMM);

  const treasuryExposureByAvailability = Object.keys(exposure).map(key => {
    return {
      key: key,
      value: exposure[key],
      percentage: exposure[key].dividedBy(totalTreasury).toNumber(),
    };
  });

  treasuryExposureByAvailability.push({
    key: 'managed',
    value: totalMM,
    percentage: totalMM.dividedBy(totalTreasury).toNumber(),
  });

  return treasuryExposureByAvailability;
};

export const selectTreasuryWalletAddressesByChainId = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id']) =>
    selectTreasuryHoldingsByChainId(state, chainId),
  (state: BeefyState, chainId: ChainEntity['id']) => selectChainById(state, chainId),

  (treasury, chain) => {
    if (!treasury) return [];

    return Object.values(treasury).map(wallet => {
      if (wallet.name.includes('validator')) {
        if (chain.id === 'ethereum') {
          const allValidatorsIds = Object.values(wallet.balances)
            .filter((v): v is TokenHoldingEntity => v.assetType === 'validator' && !!v.numberId)
            .map(validator => validator.numberId);
          return {
            address: wallet.address,
            name: 'validators',
            url: 'https://beaconcha.in/dashboard?validators=' + allValidatorsIds.join(','),
          };
        }
        return {
          address: wallet.address,
          name: 'validator',
          url: explorerAddressUrl(chain, Object.values(wallet.balances)[0].methodPath!),
        };
      }
      return {
        address: wallet.address,
        name: wallet.name,
        url: explorerAddressUrl(chain, wallet.address),
      };
    });
  }
)((_state: BeefyState, chainId: ChainEntity['id']) => chainId);
