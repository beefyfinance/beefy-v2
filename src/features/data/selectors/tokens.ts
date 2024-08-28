import { bluechipTokens } from '../../../helpers/utils';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import { isTokenErc20, isTokenNative } from '../entities/token';
import { selectAllChainIds, selectChainById } from './chains';
import { BIG_ZERO } from '../../../helpers/big-number';
import { selectIsAddressBookLoaded, selectIsPricesAvailable } from './data-loader';
import { isStandardVault, type VaultEntity } from '../entities/vault';
import { createCachedSelector } from 're-reselect';
import { selectCowcentratedLikeVaultById, selectGovVaultById, selectVaultById } from './vaults';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import { orderBy } from 'lodash-es';
import BigNumber from 'bignumber.js';
import { fromUnixTime, sub } from 'date-fns';

import {
  getDataApiBucket,
  getDataApiBucketsLongerThan,
} from '../apis/beefy/beefy-data-api-helpers';
import { createSelector } from '@reduxjs/toolkit';

export const selectIsTokenLoaded = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const byChainId = state.entities.tokens.byChainId;
  const chain = byChainId[chainId];
  if (chain === undefined) {
    throw new Error(`selectTokenById: Unknown chain id ${chainId}`);
  }
  return chain.byId[tokenId] !== undefined;
};

export const selectTokenById = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const byChainId = state.entities.tokens.byChainId;
  const chain = byChainId[chainId];

  if (chain === undefined) {
    throw new Error(`selectTokenById: Unknown chain id ${chainId}`);
  }

  const address = chain.byId[tokenId];
  if (address === undefined) {
    // fallback to addressbook token
    throw new Error(
      `selectTokenById: Unknown token id ${tokenId} for chain ${chainId}, maybe you need to load the addressbook`
    );
  }

  return chain.byAddress[address];
};

export const selectTokenByIdOrUndefined = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const byChainId = state.entities.tokens.byChainId;
  const address = byChainId[chainId]?.byId[tokenId];
  if (!address) return undefined;
  return byChainId[chainId]?.byAddress[address] || undefined;
};

export const selectTokenByAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: TokenEntity['address']
) => {
  const tokensByChainId = selectTokensByChainId(state, chainId);
  const token = tokensByChainId.byAddress[address.toLowerCase()];
  if (token === undefined) {
    throw new Error(`selectTokenByAddress: Unknown token address "${address}"`);
  }
  return token;
};

export const selectTokenByAddressOrUndefined = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: TokenEntity['address']
) => state.entities.tokens.byChainId[chainId]?.byAddress[address.toLowerCase()] || undefined;

export const selectTokensByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  const tokensByChainId = state.entities.tokens.byChainId[chainId];
  if (tokensByChainId === undefined) {
    throw new Error(`selectTokensByChainId: Unknown chain id`);
  }
  return tokensByChainId;
};

export const selectDepositTokenByVaultId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
};

/** only if vault has receipt token, and that is a share token (uses price per full share) */
export const selectShareTokenByVaultId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  if (!isStandardVault(vault)) {
    return undefined;
  }
  return selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
};

export const selectErc20TokenByAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: string,
  mapNativeToWnative: boolean = false
) => {
  const token = selectTokenByAddress(state, chainId, address);
  // type narrowing
  if (!isTokenErc20(token)) {
    if (mapNativeToWnative) {
      return selectChainWrappedNativeToken(state, chainId);
    } else {
      throw new Error(
        `selectErc20TokenByAddress: Input token ${address} is native. set mapNativeToWnative = true to automatically fetch wrapped token if needed`
      );
    }
  }
  return token;
};

export const selectChainNativeToken = (state: BeefyState, chainId: ChainEntity['id']) => {
  const byChainId = state.entities.tokens.byChainId;
  const chain = byChainId[chainId];

  if (chain === undefined) {
    throw new Error(`selectChainNativeToken: Unknown chain id ${chainId}`);
  }

  if (!chain.native) {
    // fallback to addressbook token
    throw new Error(
      `selectChainNativeToken: Empty native token for chain id ${chainId}, maybe you need to load the addressbook`
    );
  }

  const token = selectTokenById(state, chainId, chain.native);
  // type narrowing
  if (!isTokenNative(token)) {
    throw new Error(
      `selectChainNativeToken: Fetch a native token when getting native of chain ${chainId}`
    );
  }
  return token;
};

export const selectChainWrappedNativeToken = (state: BeefyState, chainId: ChainEntity['id']) => {
  const byChainId = state.entities.tokens.byChainId;
  const chain = byChainId[chainId];

  if (chain === undefined) {
    throw new Error(`selectChainWrappedNativeToken: Unknown chain id ${chainId}`);
  }

  if (!chain.wnative) {
    // fallback to addressbook token
    throw new Error(
      `selectChainWrappedNativeToken: Empty wnative token for chain id ${chainId}, maybe you need to load the addressbook`
    );
  }

  const token = selectTokenById(state, chainId, chain.wnative);
  // type narrowing
  if (!isTokenErc20(token)) {
    throw new Error(
      `selectChainWrappedNativeToken: Fetch a wnative token when getting native of chain ${chainId}`
    );
  }
  return token;
};

export const selectIsTokenStable = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id'], _tokenId: TokenEntity['id']) =>
    selectChainById(state, chainId),
  (state: BeefyState, chainId: ChainEntity['id'], tokenId: TokenEntity['id']) => tokenId,
  (chain, tokenId) => chain.stableCoins.includes(tokenId)
)((state: BeefyState, chainId: ChainEntity['id'], tokenId: TokenEntity['id']) => tokenId);

export const selectIsBeefyToken = (_: BeefyState, tokenId: TokenEntity['id']) => {
  return [
    'BIFI',
    'oldBIFI',
    'POTS',
    'beFTM',
    'beQI',
    'beJOE',
    'binSPIRIT',
    'beVELO',
    'beOPX',
    'mooBIFI',
  ].includes(tokenId);
};

export const selectIsLSDToken = (_: BeefyState, tokenId: TokenEntity['id']) => {
  return [
    'stETH',
    'wstETH',
    'rETH',
    'sETH',
    'frxETH',
    'sfrxETH',
    'cbETH',
    'ankrETH',
    'stMATIC',
    'MaticX',
    'BNBx',
    'ankrBNB',
    'sFTMx',
    'ankrFTM',
    'wstDOT',
  ].includes(tokenId);
};

export const selectIsTokenBluechip = (_: BeefyState, tokenId: TokenEntity['id']) => {
  return bluechipTokens.includes(tokenId);
};

export const selectTokenPriceByAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: string
) => {
  const token = state.entities.tokens.byChainId[chainId]?.byAddress[address.toLowerCase()];
  if (!token) return BIG_ZERO;
  return selectTokenPriceByTokenOracleId(state, token.oracleId);
};

export const selectTokenPriceByTokenOracleId = createCachedSelector(
  (state: BeefyState, oracleId: TokenEntity['oracleId']) =>
    state.entities.tokens.prices.byOracleId[oracleId],
  price => price || BIG_ZERO
)((state: BeefyState, oracleId: TokenEntity['oracleId']) => oracleId);

export const selectLpBreakdownByOracleId = (state: BeefyState, oracleId: TokenEntity['oracleId']) =>
  state.entities.tokens.breakdown.byOracleId[oracleId];

export const selectLpBreakdownForVault = (state: BeefyState, vault: VaultEntity) => {
  return selectLpBreakdownByOracleId(state, vault.breakdownId);
};

export const selectHasBreakdownDataByTokenAddress = (
  state: BeefyState,
  depositTokenAddress: VaultEntity['depositTokenAddress'],
  chainId: ChainEntity['id']
) => {
  const token = selectTokenByAddressOrUndefined(state, chainId, depositTokenAddress);
  if (!token) return false;
  return selectHasBreakdownDataByOracleId(state, token.oracleId, chainId);
};

export const selectHasBreakdownDataByOracleId = (
  state: BeefyState,
  oracleId: TokenEntity['oracleId'],
  chainId: ChainEntity['id']
) => {
  const isPricesLoaded = selectIsPricesAvailable(state);
  const isAddressBookLoaded = selectIsAddressBookLoaded(state, chainId);
  const breakdown = selectLpBreakdownByOracleId(state, oracleId);

  if (
    !isPricesLoaded ||
    !isAddressBookLoaded ||
    !breakdown ||
    !breakdown.tokens ||
    !breakdown.tokens.length ||
    !breakdown.balances ||
    breakdown.balances.length !== breakdown.tokens.length
  ) {
    return false;
  }

  // Must have tokens in state
  const tokens = breakdown.tokens.map(
    address => state.entities.tokens.byChainId[chainId]?.byAddress[address.toLowerCase()]
  );
  if (tokens.findIndex(token => !token) !== -1) {
    return false;
  }

  // Must have prices of tokens in state
  return (
    tokens.findIndex(token => !state.entities.tokens.prices.byOracleId[token!.oracleId]) === -1
  );
};

export const selectIsTokenLoadedOnChain = createCachedSelector(
  (state: BeefyState, _address: TokenEntity['address'], chainId: ChainEntity['id']) =>
    state.entities.tokens.byChainId[chainId],
  (state: BeefyState, address: TokenEntity['address']) => address.toLowerCase(),
  (tokensByChainId, address) => tokensByChainId?.byAddress[address] !== undefined
)((state: BeefyState, address: TokenEntity['address'], _chainId: ChainEntity['id']) => address);

export const selectWrappedToNativeSymbolMap = (state: BeefyState) => {
  const chainIds = selectAllChainIds(state);

  const wrappedToNativeSymbolMap = new Map();

  for (const chainId of chainIds) {
    const wnative = selectChainWrappedNativeToken(state, chainId);
    const native = selectChainNativeToken(state, chainId);
    wrappedToNativeSymbolMap.set(wnative.symbol, native.symbol);
  }
  return wrappedToNativeSymbolMap;
};

export const selectWrappedToNativeSymbolOrTokenSymbol = createCachedSelector(
  (state: BeefyState, _symbol: string) => selectWrappedToNativeSymbolMap(state),
  (state: BeefyState, symbol: string) => symbol,
  (wrappedToNativeSymbolMap, symbol) => {
    return wrappedToNativeSymbolMap.has(symbol) ? wrappedToNativeSymbolMap.get(symbol) : symbol;
  }
)((state: BeefyState, symbol: string) => symbol);

export const selectPriceWithChange = createCachedSelector(
  (state: BeefyState, oracleId: string, _bucket: ApiTimeBucket) =>
    selectTokenPriceByTokenOracleId(state, oracleId),
  (state: BeefyState, oracleId: string, _bucket: ApiTimeBucket) =>
    state.biz.historical.prices.byOracleId[oracleId],
  (_state: BeefyState, _oracleId: string, bucket: ApiTimeBucket) => bucket,
  (price, oracle, requestedBucket) => {
    // wait for price, or load if no buckets have been requested yet
    if (!price || !oracle) {
      return {
        bucket: requestedBucket,
        price: undefined,
        shouldLoad: !!price,
        previousPrice: undefined,
        previousDate: undefined,
      };
    }

    const thisBucket = getDataApiBucket(requestedBucket);
    const possibleBuckets = [thisBucket].concat(getDataApiBucketsLongerThan(requestedBucket));
    const readyBucket = possibleBuckets.find(bucket => {
      const state = oracle.byTimeBucket[bucket.id];
      return state && state.alreadyFulfilled && state.data && state.data.length > 0;
    });

    // if any of the buckets contains data, we can use it
    // (if this bucket doesn't contain the data we want, neither will any other)
    if (readyBucket) {
      const { range } = readyBucket;
      const data = oracle.byTimeBucket[readyBucket.id]!.data!; // we checked we have data already
      const oneRangeAgo = Math.floor(sub(new Date(), range).getTime() / 1000);
      const oneDayAgoPricePoint = orderBy(data, 't', 'asc').find(point => point.t > oneRangeAgo);

      if (oneDayAgoPricePoint && oneDayAgoPricePoint.v) {
        const previousPrice = new BigNumber(oneDayAgoPricePoint.v);
        const previousDate = fromUnixTime(oneDayAgoPricePoint.t);
        return { bucket: readyBucket.id, price, shouldLoad: false, previousPrice, previousDate };
      }

      return {
        bucket: readyBucket.id,
        price,
        shouldLoad: false,
        previousPrice: undefined,
        previousDate: undefined,
      };
    }

    const pendingBucket = possibleBuckets.find(bucket => {
      const state = oracle.byTimeBucket[bucket.id];
      return state && state.status === 'pending';
    });

    // if a bucket is pending, wait on it instead
    if (pendingBucket) {
      return {
        bucket: pendingBucket.id,
        price,
        shouldLoad: false,
        previousPrice: undefined,
        previousDate: undefined,
      };
    }

    // no bucket is pending, load the requested one
    return {
      bucket: requestedBucket,
      price,
      shouldLoad: true,
      previousPrice: undefined,
      previousDate: undefined,
    };
  }
)((_state: BeefyState, oracleId: string, bucket: ApiTimeBucket) => `${oracleId}-${bucket}`);

export const selectSupportedSwapTokenAddressesForChainAggregator = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  providerId: string
) => {
  return state.entities.zaps.swaps.byChainId[chainId]?.byProvider[providerId] || [];
};

export const selectSupportedSwapTokensForChainAggregator = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  providerId: string
) => {
  return selectSupportedSwapTokenAddressesForChainAggregator(state, chainId, providerId)
    .map(address => selectTokenByAddressOrUndefined(state, chainId, address))
    .filter((v): v is TokenEntity => !!v);
};

export const selectSupportedSwapTokensForChainAggregatorHavingPrice = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  providerId: string
) => {
  return selectSupportedSwapTokensForChainAggregator(state, chainId, providerId).filter(token =>
    selectTokenPriceByTokenOracleId(state, token.oracleId).gt(BIG_ZERO)
  );
};

export const selectVaultTokenSymbols = createCachedSelector(
  selectVaultById,
  (state: BeefyState) => state.entities.tokens.byChainId,
  (vault, tokensByChainId) => {
    return vault.assetIds.map(assetId => {
      const address = tokensByChainId[vault.chainId]?.byId[assetId];
      if (!address) {
        return assetId;
      }

      const token = tokensByChainId[vault.chainId]?.byAddress[address];
      return token?.symbol || assetId;
    });
  }
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectCurrentCowcentratedRangesByOracleId = (
  state: BeefyState,
  oracleId: TokenEntity['oracleId']
) => {
  return state.entities.tokens.cowcentratedRanges.byOracleId[oracleId] || undefined;
};

export const selectCurrentCowcentratedRangesByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const depositToken = selectDepositTokenByVaultId(state, vaultId);
  return selectCurrentCowcentratedRangesByOracleId(state, depositToken.oracleId);
};

export const selectCowcentratedLikeVaultDepositTokens = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const vault = selectCowcentratedLikeVaultById(state, vaultId);
  const token0 = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddresses[0]);
  const token1 = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddresses[1]);

  return {
    token0,
    token1,
  };
};

export const selectCowcentratedLikeVaultDepositTokensWithPrices = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const { token1, token0 } = selectCowcentratedLikeVaultDepositTokens(state, vaultId);
  const token0Price = selectTokenPriceByTokenOracleId(state, token0.oracleId);
  const token1Price = selectTokenPriceByTokenOracleId(state, token1.oracleId);

  return {
    token0: {
      ...token0,
      price: token0Price,
    },
    token1: {
      ...token1,
      price: token1Price,
    },
  };
};

export const selectGovVaultEarnedTokens = createSelector(
  (state: BeefyState, _chainId: ChainEntity['id'], vaultId: VaultEntity['id']) =>
    selectGovVaultById(state, vaultId),
  (state: BeefyState, chainId: ChainEntity['id'], _vaultId: VaultEntity['id']) =>
    state.entities.tokens.byChainId[chainId]?.byAddress,
  (vault, byAddress) => {
    return vault.earnedTokenAddresses.map(address => {
      const token = byAddress?.[address.toLowerCase()];
      if (!token) {
        throw new Error(`selectGovVaultEarnedTokens: Unknown token address ${address}`);
      }
      return token;
    });
  }
);
