import type { BeefyState } from '../../../redux-types';
import type { VaultEntity } from '../entities/vault';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { TokenEntity } from '../entities/token';
import { createSelector } from '@reduxjs/toolkit';
import type { ChartStat } from '../reducers/historical-types';
import { mapValues } from 'lodash-es';
import { selectVaultShouldShowInterest } from './data-loader';
import { TIME_BUCKETS } from '../../vault/components/HistoricGraph/utils';

export function selectHistoricalRangesStatus(state: BeefyState, vaultId: VaultEntity['id']) {
  return state.biz.historical.ranges.byVaultId[vaultId]?.status || 'idle';
}

export function selectHistoricalHasAnyChart(state: BeefyState, vaultId: VaultEntity['id']) {
  return (
    selectHistoricalHasApyChart(state, vaultId) ||
    selectHistoricalHasTvlChart(state, vaultId) ||
    selectHistoricalHasPriceChart(state, vaultId)
  );
}

export function selectHistoricalHasApyChart(state: BeefyState, vaultId: VaultEntity['id']) {
  return Object.values(
    state.biz.historical.apys.byVaultId[vaultId]?.availableTimebuckets || {}
  ).some(v => v);
}

export function selectHistoricalHasTvlChart(state: BeefyState, vaultId: VaultEntity['id']) {
  return Object.values(
    state.biz.historical.tvls.byVaultId[vaultId]?.availableTimebuckets || {}
  ).some(v => v);
}

export function selectHistoricalHasPriceChart(
  state: BeefyState,
  oracleId: TokenEntity['oracleId']
) {
  return Object.values(
    state.biz.historical.prices.byOracleId[oracleId]?.availableTimebuckets || {}
  ).some(v => v);
}

export const selectHistoricalAvailableCharts = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId']) =>
    selectHistoricalHasPriceChart(state, oracleId),
  selectHistoricalHasApyChart,
  selectHistoricalHasTvlChart,
  selectVaultShouldShowInterest,
  (hasPriceChart, hasApyChart, hasTvlChart, showApy) => {
    const availableCharts: ChartStat[] = [];
    if (hasApyChart && showApy) {
      availableCharts.push('apy');
    }
    if (hasTvlChart) {
      availableCharts.push('tvl');
    }
    if (hasPriceChart) {
      availableCharts.push('price');
    }
    return availableCharts;
  }
);

export function selectHistoricalApyBucketStatus(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  bucket: ApiTimeBucket
) {
  return state.biz.historical.apys.byVaultId[vaultId]?.byTimebucket[bucket]?.status || 'idle';
}

export function selectHistoricalTvlBucketStatus(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  bucket: ApiTimeBucket
) {
  return state.biz.historical.tvls.byVaultId[vaultId]?.byTimebucket[bucket]?.status || 'idle';
}

export function selectHistoricalPriceBucketStatus(
  state: BeefyState,
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
) {
  return state.biz.historical.prices.byOracleId[oracleId]?.byTimebucket[bucket]?.status || 'idle';
}

export function selectHistoricalApyBucketData(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  bucket: ApiTimeBucket
) {
  return state.biz.historical.apys.byVaultId[vaultId]?.byTimebucket[bucket]?.data || [];
}

export function selectHistoricalTvlBucketData(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  bucket: ApiTimeBucket
) {
  return state.biz.historical.tvls.byVaultId[vaultId]?.byTimebucket[bucket]?.data || [];
}

export function selectHistoricalPriceBucketData(
  state: BeefyState,
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
) {
  return state.biz.historical.prices.byOracleId[oracleId]?.byTimebucket[bucket]?.data || [];
}

const unavailableBuckets = mapValues(TIME_BUCKETS, () => false);

export function selectHistoricalPriceAvailableBuckets(
  state: BeefyState,
  oracleId: TokenEntity['oracleId']
) {
  return (
    state.biz.historical.prices.byOracleId[oracleId]?.availableTimebuckets || unavailableBuckets
  );
}

export function selectHistoricalApyAvailableBuckets(state: BeefyState, vaultId: VaultEntity['id']) {
  return state.biz.historical.apys.byVaultId[vaultId]?.availableTimebuckets || unavailableBuckets;
}

export function selectHistoricalTvlAvailableBuckets(state: BeefyState, vaultId: VaultEntity['id']) {
  return state.biz.historical.tvls.byVaultId[vaultId]?.availableTimebuckets || unavailableBuckets;
}

export function selectHistoricalPriceLoadedBuckets(
  state: BeefyState,
  oracleId: TokenEntity['oracleId']
) {
  return state.biz.historical.prices.byOracleId[oracleId]?.loadedTimebuckets || unavailableBuckets;
}

export function selectHistoricalApyLoadedBuckets(state: BeefyState, vaultId: VaultEntity['id']) {
  return state.biz.historical.apys.byVaultId[vaultId]?.loadedTimebuckets || unavailableBuckets;
}

export function selectHistoricalTvlLoadedBuckets(state: BeefyState, vaultId: VaultEntity['id']) {
  return state.biz.historical.tvls.byVaultId[vaultId]?.loadedTimebuckets || unavailableBuckets;
}

export function selectHistoricalPriceBucketIsLoaded(
  state: BeefyState,
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
) {
  return selectHistoricalPriceLoadedBuckets(state, oracleId)[bucket];
}

export function selectHistoricalApyBucketIsLoaded(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  bucket: ApiTimeBucket
) {
  return selectHistoricalApyLoadedBuckets(state, vaultId)[bucket];
}

export function selectHistoricalTvlBucketIsLoaded(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  bucket: ApiTimeBucket
) {
  return selectHistoricalTvlLoadedBuckets(state, vaultId)[bucket];
}

export function selectHistoricalBucketStatus(
  state: BeefyState,
  stat: ChartStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
) {
  switch (stat) {
    case 'apy':
      return selectHistoricalApyBucketStatus(state, vaultId, bucket);
    case 'tvl':
      return selectHistoricalTvlBucketStatus(state, vaultId, bucket);
    case 'price':
      return selectHistoricalPriceBucketStatus(state, oracleId, bucket);
  }

  throw new Error(`Unknown stat: ${stat}`);
}

export function selectHistoricalAvailableBuckets(
  state: BeefyState,
  stat: ChartStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId']
) {
  switch (stat) {
    case 'apy':
      return selectHistoricalApyAvailableBuckets(state, vaultId);
    case 'tvl':
      return selectHistoricalTvlAvailableBuckets(state, vaultId);
    case 'price':
      return selectHistoricalPriceAvailableBuckets(state, oracleId);
  }

  throw new Error(`Unknown stat: ${stat}`);
}

export function selectHistoricalBucketIsLoaded(
  state: BeefyState,
  stat: ChartStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
) {
  switch (stat) {
    case 'apy':
      return selectHistoricalApyBucketIsLoaded(state, vaultId, bucket);
    case 'tvl':
      return selectHistoricalTvlBucketIsLoaded(state, vaultId, bucket);
    case 'price':
      return selectHistoricalPriceBucketIsLoaded(state, oracleId, bucket);
  }

  throw new Error(`Unknown stat: ${stat}`);
}

export function selectHistoricalBucketData(
  state: BeefyState,
  stat: ChartStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
) {
  switch (stat) {
    case 'apy':
      return selectHistoricalApyBucketData(state, vaultId, bucket);
    case 'tvl':
      return selectHistoricalTvlBucketData(state, vaultId, bucket);
    case 'price':
      return selectHistoricalPriceBucketData(state, oracleId, bucket);
  }

  throw new Error(`Unknown stat: ${stat}`);
}
