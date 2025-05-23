import { bluechipTokens, memeTokens } from '../../../helpers/utils.ts';
import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fromUnixTime, sub } from 'date-fns';
import { orderBy } from 'lodash-es';
import { createCachedSelector } from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import {
  getDataApiBucket,
  getDataApiBucketsLongerThan,
} from '../apis/beefy/beefy-data-api-helpers.ts';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import { isTokenErc20, isTokenNative } from '../entities/token.ts';
import { isStandardVault, type VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { isDefined } from '../utils/array-utils.ts';
import { valueOrThrow } from '../utils/selector-utils.ts';
import { selectAllChainIds, selectChainById } from './chains.ts';
import {
  createChainDataSelector,
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  shouldLoaderLoadOnce,
} from './data-loader-helpers.ts';
import { selectHistoricalPriceBucketDispatchedRecently } from './historical.ts';
import { selectIsPricesAvailable } from './prices.ts';
import {
  selectCowcentratedLikeVaultById,
  selectGovVaultById,
  selectVaultById,
  selectVaultByIdWithReceiptOrUndefined,
  selectVaultPricePerFullShare,
} from './vaults.ts';

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
) =>
  valueOrThrow(
    state.entities.tokens.byChainId[chainId]?.byAddress[address.toLowerCase()],
    `selectTokenByAddress: Unknown token address "${address}"`
  );

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
  (_state: BeefyState, _chainId: ChainEntity['id'], tokenId: TokenEntity['id']) => tokenId,
  (chain, tokenId) => chain.stableCoins.includes(tokenId)
)((_state: BeefyState, _chainId: ChainEntity['id'], tokenId: TokenEntity['id']) => tokenId);

export const selectIsTokenBluechip = (_: BeefyState, tokenId: TokenEntity['id']) => {
  return bluechipTokens.includes(tokenId);
};

export const selectIsTokenMeme = (_: BeefyState, tokenId: TokenEntity['id']) => {
  return memeTokens.includes(tokenId);
};

export const selectTokenPriceByAddress = createSelector(
  selectTokenByAddressOrUndefined,
  (state: BeefyState) => state.entities.tokens.prices.byOracleId,
  (token, pricesByOracleId) => {
    return (token && pricesByOracleId[token.oracleId]) || BIG_ZERO;
  }
);

export const selectTokenPriceByTokenOracleId = (
  state: BeefyState,
  oracleId: TokenEntity['oracleId']
) => state.entities.tokens.prices.byOracleId[oracleId] || BIG_ZERO;

export const selectVaultReceiptTokenPrice = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  ppfs?: BigNumber
) => {
  const vault = selectVaultByIdWithReceiptOrUndefined(state, vaultId);
  if (!vault) {
    return BIG_ZERO;
  }
  const receiptTokenPPFS = ppfs || selectVaultPricePerFullShare(state, vaultId);
  const depositTokenPrice = selectTokenPriceByAddress(
    state,
    vault.chainId,
    vault.depositTokenAddress
  );
  return depositTokenPrice.times(receiptTokenPPFS);
};

export const selectLpBreakdownByOracleId = (state: BeefyState, oracleId: TokenEntity['oracleId']) =>
  state.entities.tokens.breakdown.byOracleId[oracleId];

export const selectLpBreakdownForVault = (state: BeefyState, vault: VaultEntity) => {
  return selectLpBreakdownByOracleId(state, vault.breakdownId);
};

export const selectLpBreakdownForVaultId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return selectLpBreakdownForVault(state, selectVaultById(state, vaultId));
};

const selectShouldInitAddressBookGlobal = createGlobalDataSelector(
  'addressBook',
  shouldLoaderLoadOnce
);
export const selectIsAddressBookLoadedGlobal = createGlobalDataSelector(
  'addressBook',
  hasLoaderFulfilledOnce
);
const selectShouldInitAddressBookChain = createChainDataSelector(
  'addressBook',
  shouldLoaderLoadOnce
);
const selectIsAddressBookLoadedChain = createChainDataSelector(
  'addressBook',
  hasLoaderFulfilledOnce
);
export const selectShouldInitAddressBook = (state: BeefyState, chainId: ChainEntity['id']) =>
  selectShouldInitAddressBookGlobal(state) || selectShouldInitAddressBookChain(state, chainId);
export const selectIsAddressBookLoaded = (state: BeefyState, chainId: ChainEntity['id']) =>
  selectIsAddressBookLoadedGlobal(state) || selectIsAddressBookLoadedChain(state, chainId);
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

export const selectHasBreakdownDataByTokenAddress = (
  state: BeefyState,
  depositTokenAddress: VaultEntity['depositTokenAddress'],
  chainId: ChainEntity['id']
) => {
  const token = selectTokenByAddressOrUndefined(state, chainId, depositTokenAddress);
  if (!token) return false;
  return selectHasBreakdownDataByOracleId(state, token.oracleId, chainId);
};

export const selectHasBreakdownDataForVault = (state: BeefyState, vault: VaultEntity) => {
  return selectHasBreakdownDataByOracleId(state, vault.breakdownId, vault.chainId);
};

export const selectHasBreakdownDataForVaultId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return selectHasBreakdownDataForVault(state, selectVaultById(state, vaultId));
};

export const selectIsTokenLoadedOnChain = createCachedSelector(
  (state: BeefyState, _address: TokenEntity['address'], chainId: ChainEntity['id']) =>
    state.entities.tokens.byChainId[chainId],
  (_state: BeefyState, address: TokenEntity['address']) => address.toLowerCase(),
  (tokensByChainId, address) => tokensByChainId?.byAddress[address] !== undefined
)((_state: BeefyState, address: TokenEntity['address'], _chainId: ChainEntity['id']) => address);

export const selectWrappedToNativeSymbolMap = (state: BeefyState) => {
  const chainIds = selectAllChainIds(state);

  const wrappedToNativeSymbolMap = new Map<string, string>();

  for (const chainId of chainIds) {
    const wnative = selectChainWrappedNativeToken(state, chainId);
    const native = selectChainNativeToken(state, chainId);
    wrappedToNativeSymbolMap.set(wnative.symbol, native.symbol);
  }
  return wrappedToNativeSymbolMap;
};

export const selectWrappedToNativeSymbolOrTokenSymbol = createCachedSelector(
  (state: BeefyState, _symbol: string) => selectWrappedToNativeSymbolMap(state),
  (_state: BeefyState, symbol: string) => symbol,
  (wrappedToNativeSymbolMap, symbol) => {
    return wrappedToNativeSymbolMap.get(symbol) || symbol;
  }
)((_state: BeefyState, symbol: string) => symbol);

export const selectPriceWithChange = createCachedSelector(
  (state: BeefyState, oracleId: string, _bucket: ApiTimeBucket) =>
    selectTokenPriceByTokenOracleId(state, oracleId),
  (state: BeefyState, oracleId: string, _bucket: ApiTimeBucket) =>
    state.biz.historical.prices.byOracleId[oracleId],
  (state: BeefyState, oracleId: string, bucket: ApiTimeBucket) =>
    selectHistoricalPriceBucketDispatchedRecently(state, oracleId, bucket),
  (_state: BeefyState, _oracleId: string, bucket: ApiTimeBucket) => bucket,
  (price, oracle, dispatchedRecently, requestedBucket) => {
    // wait for price, or load if no buckets have been requested yet
    if (!price || !oracle) {
      return {
        bucket: requestedBucket,
        price: undefined,
        shouldLoad: !!price && !dispatchedRecently,
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
      shouldLoad: !dispatchedRecently,
      previousPrice: undefined,
      previousDate: undefined,
    };
  }
)((_state: BeefyState, oracleId: string, bucket: ApiTimeBucket) => `${oracleId}-${bucket}`);

export const selectSupportedSwapTokensForChainAggregator = createSelector(
  (state: BeefyState, chainId: ChainEntity['id'], providerId: string) =>
    state.entities.zaps.swaps.byChainId[chainId]?.byProvider[providerId],
  (state: BeefyState, chainId: ChainEntity['id']) =>
    state.entities.tokens.byChainId[chainId]?.byAddress,
  (addresses, byAddress) => {
    if (!byAddress || !addresses || !addresses.length) {
      return [];
    }
    return addresses.map(address => byAddress[address.toLowerCase()]).filter(isDefined);
  }
);

export const selectSupportedSwapTokensForChainAggregatorHavingPrice = createSelector(
  selectSupportedSwapTokensForChainAggregator,
  (state: BeefyState) => state.entities.tokens.prices.byOracleId,
  (tokens, pricesByOracleId) =>
    tokens.filter(token => pricesByOracleId[token.oracleId]?.gt(BIG_ZERO))
);

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

export const selectVaultIcons = createCachedSelector(
  selectVaultById,
  (state: BeefyState) => state.entities.tokens.byChainId,
  (vault, tokensByChainId) => {
    if (vault.icons?.length) {
      return vault.icons;
    }

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

export const selectCowcentratedLikeVaultDepositTokens = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectCowcentratedLikeVaultById(state, vaultId),
  (state: BeefyState) => state.entities.tokens.byChainId,
  (vault, tokensByChainId) =>
    vault.depositTokenAddresses.map(address =>
      valueOrThrow(
        tokensByChainId[vault.chainId]?.byAddress[address.toLowerCase()],
        `selectCowcentratedLikeVaultDepositTokens: Unknown token address "${address}"`
      )
    ) as [TokenEntity, TokenEntity]
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectCowcentratedLikeVaultDepositTokensWithPrices = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectCowcentratedLikeVaultDepositTokens(state, vaultId),
  (state: BeefyState) => state.entities.tokens.prices.byOracleId,
  (tokens, pricesByOracleId) =>
    tokens.map(token => ({ ...token, price: pricesByOracleId[token.oracleId] || BIG_ZERO }))
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

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
