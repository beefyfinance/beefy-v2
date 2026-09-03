import BigNumber from 'bignumber.js';
import { orderBy } from 'lodash-es';
import { createCachedSelector } from 're-reselect';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types.ts';
import {
  getDataApiBucket,
  getDataApiBucketsLongerThan,
} from '../apis/beefy/beefy-data-api-helpers.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { selectHistoricalPriceBucketDispatchedRecently } from './historical.ts';
import {
  isTokenStock,
  selectTokenPriceByTokenOracleId,
  selectVaultAssetTokensOrUndefined,
} from './tokens.ts';

/** hourly points covering a week - the finest resolution the data api offers, and enough to reach Friday */
export const STOCK_PRICE_BUCKET: ApiTimeBucket = '1h_1w';

const EMPTY_TOKENS: TokenEntity[] = [];

/** The stock legs of a vault, in `assetIds` order; empty for a vault holding no tokenized stock. */
export const selectVaultStockTokens = createCachedSelector(
  selectVaultAssetTokensOrUndefined,
  (tokens): TokenEntity[] => {
    const stocks = tokens?.filter(isTokenStock);
    return stocks?.length ? stocks : EMPTY_TOKENS;
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

/**
 * Display name for a stock token. Issuers differ - Coinbase ships "Apple Inc." while Robinhood
 * ships "Tesla • Robinhood Token" - so drop anything after the bullet.
 */
export function selectStockTokenName(token: TokenEntity): string {
  return token.name?.split('•')[0].trim() || token.symbol;
}

/** a weekend gap wider than this is treated as bad data rather than a real move */
const MAX_PLAUSIBLE_DIFFERENCE = 0.5;

/**
 * Signed move from the close as a ratio, or undefined when the pair is not worth showing:
 * a gap this wide is bad data - most likely the 1.0 placeholder the prices reducer substitutes
 * for a null quote, or a junk history point - and a wrong number is worse than no banner.
 */
export function getStockWeekendDifference(
  price: BigNumber | undefined,
  closePrice: BigNumber | undefined
): BigNumber | undefined {
  if (!price || !closePrice || closePrice.isZero()) {
    return undefined;
  }
  const difference = price.minus(closePrice).div(closePrice);
  return difference.abs().gt(MAX_PLAUSIBLE_DIFFERENCE) ? undefined : difference;
}

export type StockPriceAtClose = {
  /** the bucket to request when `shouldLoad` */
  bucket: ApiTimeBucket;
  /** whether the caller should dispatch fetchHistoricalPrices for `bucket` */
  shouldLoad: boolean;
  /** live price, undefined until prices load */
  price: BigNumber | undefined;
  /** last price at or before the close, undefined until history loads */
  closePrice: BigNumber | undefined;
};

/**
 * Live price plus the last historical price at or before `closedAtUnix`.
 *
 * The data api has no point-in-time endpoint and its hourly grid is anchored to the current
 * 15-minute snapshot rather than the wall clock, so the chosen point sits up to an hour before
 * the bell and can shift by a slot as time passes.
 */
export const selectStockPriceAtClose = createCachedSelector(
  (state: BeefyState, oracleId: TokenEntity['oracleId'], _closedAtUnix: number) =>
    selectTokenPriceByTokenOracleId(state, oracleId),
  (state: BeefyState, oracleId: TokenEntity['oracleId'], _closedAtUnix: number) =>
    state.biz.historical.prices.byOracleId[oracleId],
  (state: BeefyState, oracleId: TokenEntity['oracleId'], _closedAtUnix: number) =>
    selectHistoricalPriceBucketDispatchedRecently(state, oracleId, STOCK_PRICE_BUCKET),
  (_state: BeefyState, _oracleId: TokenEntity['oracleId'], closedAtUnix: number) => closedAtUnix,
  (price, oracle, dispatchedRecently, closedAtUnix): StockPriceAtClose => {
    // an oracle absent from the prices payload reads as zero; one present but null is stored as the
    // placeholder 1.0, which only the caller's plausibility check on the difference can catch
    const livePrice = price && price.gt(0) ? price : undefined;

    if (!oracle) {
      return {
        bucket: STOCK_PRICE_BUCKET,
        shouldLoad: !dispatchedRecently,
        price: livePrice,
        closePrice: undefined,
      };
    }

    const possibleBuckets = [getDataApiBucket(STOCK_PRICE_BUCKET)].concat(
      getDataApiBucketsLongerThan(STOCK_PRICE_BUCKET)
    );
    const readyBucket = possibleBuckets.find(bucket => {
      const bucketState = oracle.byTimeBucket[bucket.id];
      return bucketState?.alreadyFulfilled && !!bucketState.data?.length;
    });

    if (readyBucket) {
      const data = oracle.byTimeBucket[readyBucket.id]!.data!;
      const closePoint = orderBy(data, 't', 'desc').find(
        point => point.t <= closedAtUnix && !!point.v
      );
      return {
        bucket: readyBucket.id,
        shouldLoad: false,
        price: livePrice,
        closePrice: closePoint ? new BigNumber(closePoint.v) : undefined,
      };
    }

    const pendingBucket = possibleBuckets.find(
      bucket => oracle.byTimeBucket[bucket.id]?.status === 'pending'
    );

    return {
      bucket: pendingBucket?.id ?? STOCK_PRICE_BUCKET,
      shouldLoad: !pendingBucket && !dispatchedRecently,
      price: livePrice,
      closePrice: undefined,
    };
  }
)(
  (_state: BeefyState, oracleId: TokenEntity['oracleId'], closedAtUnix: number) =>
    `${oracleId}-${closedAtUnix}`
);
