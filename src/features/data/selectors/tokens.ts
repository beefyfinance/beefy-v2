import { bluechipTokens } from '../../../helpers/utils';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import { isTokenErc20, isTokenNative } from '../entities/token';
import { selectAllChainIds, selectChainById } from './chains';
import { BIG_ZERO } from '../../../helpers/big-number';
import { selectIsAddressBookLoaded } from './data-loader';
import type { VaultEntity } from '../entities/vault';
import { createCachedSelector } from 're-reselect';
import { selectVaultById } from './vaults';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import {
  selectHistoricalPriceBucketData,
  selectHistoricalPriceBucketIsLoaded,
  selectHistoricalPriceBucketStatus,
} from './historical';
import { orderBy } from 'lodash-es';
import BigNumber from 'bignumber.js';
import { fromUnixTime, sub } from 'date-fns';
import { TIME_BUCKETS } from '../../vault/components/HistoricGraph/utils';

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
    throw new Error(`selectTokenByAddress: Unknown token address ${address}`);
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

export const selectLpBreakdownByTokenAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  address: string
) => {
  const token = selectTokenByAddress(state, chainId, address);
  return selectLpBreakdownByOracleId(state, token.oracleId);
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
  const isPricesLoaded = state.ui.dataLoader.global.prices.alreadyLoadedOnce;
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
  (state: BeefyState, oracleId: string, bucket: ApiTimeBucket) =>
    selectHistoricalPriceBucketStatus(state, oracleId, bucket),
  (state: BeefyState, oracleId: string, bucket: ApiTimeBucket) =>
    selectHistoricalPriceBucketIsLoaded(state, oracleId, bucket),
  (state: BeefyState, oracleId: string, bucket: ApiTimeBucket) =>
    selectHistoricalPriceBucketData(state, oracleId, bucket),
  (state: BeefyState, oracleId: string, bucket: ApiTimeBucket) => TIME_BUCKETS[bucket].range,
  (price, status, loaded, data, range) => {
    if (!price) {
      return {
        price: undefined,
        shouldLoad: false,
        previousPrice: undefined,
        previousDate: undefined,
      };
    }

    if (!loaded && status === 'idle') {
      return { price, shouldLoad: true, previousPrice: undefined, previousDate: undefined };
    }

    if (!loaded || !data || data.length === 0) {
      return { price, shouldLoad: false, previousPrice: undefined, previousDate: undefined };
    }

    const oneRangeAgo = Math.floor(sub(new Date(), range).getTime() / 1000);
    const oneDayAgoPricePoint = orderBy(data, 't', 'asc').find(point => point.t > oneRangeAgo);
    if (!oneDayAgoPricePoint || !oneDayAgoPricePoint.v) {
      return { price, shouldLoad: false, previousPrice: undefined, previousDate: undefined };
    }

    const previousPrice = new BigNumber(oneDayAgoPricePoint.v);
    const previousDate = fromUnixTime(oneDayAgoPricePoint.t);
    return { price, shouldLoad: false, previousPrice, previousDate };
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

export const selectVaultTokenSymbols = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return vault.assetIds.map(assetId => {
    const token = selectTokenByIdOrUndefined(state, vault.chainId, assetId);

    return token?.symbol || assetId;
  });
};
