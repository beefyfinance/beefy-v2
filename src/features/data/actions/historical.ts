import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyDataApi } from '../apis/instances';
import { isCowcentratedLikeVault, type VaultEntity } from '../entities/vault';
import type {
  ApiChartData,
  ApiCowcentratedChartData,
  ApiRanges,
  ApiTimeBucket,
} from '../apis/beefy/beefy-data-api-types';
import { selectCowcentratedLikeVaultById, selectVaultById } from '../selectors/vaults';
import { selectTokenByAddress } from '../selectors/tokens';
import type { TokenEntity } from '../entities/token';
import type { ThunkAction } from 'redux-thunk';
import type { Action } from 'redux';
import { featureFlag_simulateBeefyApiError } from '../utils/feature-flags';
import { sleep } from '../utils/async-utils';
import type { ChartStat } from '../../vault/components/HistoricGraph/types';
import { getCowcentratedAddressFromCowcentratedLikeVault } from '../utils/vault-utils';

export interface HistoricalRangesPayload {
  vaultId: VaultEntity['id'];
  oracleId: TokenEntity['oracleId'];
  ranges: ApiRanges;
  isCowcentrated: boolean;
}

export interface HistoricalRangesParams {
  vaultId: VaultEntity['id'];
}

export const fetchHistoricalRanges = createAsyncThunk<
  HistoricalRangesPayload,
  HistoricalRangesParams,
  { state: BeefyState }
>('historical/fetchHistoricalRanges', async ({ vaultId }, { getState }) => {
  const state = getState();
  const vault = selectVaultById(state, vaultId);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const api = await getBeefyDataApi();
  const isCowcentratedLike = isCowcentratedLikeVault(vault);

  const ranges = await api.getAvailableRanges(
    vaultId,
    depositToken.oracleId,
    isCowcentratedLike ? getCowcentratedAddressFromCowcentratedLikeVault(vault) : undefined,
    isCowcentratedLike ? vault.chainId : undefined
  );

  return { vaultId, oracleId: depositToken.oracleId, ranges, isCowcentrated: isCowcentratedLike };
});

export interface HistoricalApysPayload {
  data: ApiChartData;
}

export interface HistoricalApysParams {
  vaultId: VaultEntity['id'];
  bucket: ApiTimeBucket;
}

export const fetchHistoricalApys = createAsyncThunk<
  HistoricalApysPayload,
  HistoricalApysParams,
  { state: BeefyState }
>('historical/fetchHistoricalApys', async ({ vaultId, bucket }) => {
  const api = await getBeefyDataApi();
  const data = await api.getApyChartData(vaultId, bucket);

  return { data };
});

export interface HistoricalTvlsPayload {
  data: ApiChartData;
}

export interface HistoricalTvlsParams {
  vaultId: VaultEntity['id'];
  bucket: ApiTimeBucket;
}

export const fetchHistoricalTvls = createAsyncThunk<
  HistoricalTvlsPayload,
  HistoricalTvlsParams,
  { state: BeefyState }
>('historical/fetchHistoricalTvls', async ({ vaultId, bucket }) => {
  const api = await getBeefyDataApi();
  const data = await api.getTvlChartData(vaultId, bucket);

  return { data };
});

export interface HistoricalPricesPayload {
  data: ApiChartData;
}

export interface HistoricalPricesParams {
  oracleId: TokenEntity['oracleId'];
  bucket: ApiTimeBucket;
}

export const fetchHistoricalPrices = createAsyncThunk<
  HistoricalPricesPayload,
  HistoricalPricesParams,
  { state: BeefyState }
>('historical/fetchHistoricalPrices', async ({ oracleId, bucket }) => {
  if (featureFlag_simulateBeefyApiError('historical-prices')) {
    await sleep(5000);
    throw new Error('Simulated beefy data api error');
  }

  const api = await getBeefyDataApi();
  const data = await api.getPriceChartData(oracleId, bucket);
  return { data };
});

export interface HistoricalCowcentratedPayload {
  data: ApiCowcentratedChartData;
}

export interface HistoricalCowcentratedParams {
  vaultId: VaultEntity['id'];
  bucket: ApiTimeBucket;
}

export const fetchHistoricalCowcentratedRanges = createAsyncThunk<
  HistoricalCowcentratedPayload,
  HistoricalCowcentratedParams,
  { state: BeefyState }
>('historical/fetchHistoricalCowcentratedRanges', async ({ bucket, vaultId }, { getState }) => {
  const state = getState();
  const vault = selectCowcentratedLikeVaultById(state, vaultId);
  const api = await getBeefyDataApi();
  const bucketToUse =
    Date.now() / 1000 - vault.createdAt >= 60 * 60 * 24 * 30 ? bucket : ('1h_1M' as ApiTimeBucket);

  const clmAddress = getCowcentratedAddressFromCowcentratedLikeVault(vault);
  const rawData = await api.getCowcentratedRangesChartData(clmAddress, bucketToUse, vault.chainId);

  const data = rawData.map(item => {
    return {
      ...item,
      v: Number(item.v),
      min: Number(item.min),
      max: Number(item.max),
    };
  }) satisfies ApiCowcentratedChartData;

  return { data };
});

export function fetchHistoricalStat(
  stat: ChartStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
): ThunkAction<unknown, unknown, unknown, Action<unknown>> {
  switch (stat) {
    case 'apy':
      return fetchHistoricalApys({ vaultId, bucket });
    case 'tvl':
      return fetchHistoricalTvls({ vaultId, bucket });
    case 'price':
      return fetchHistoricalPrices({ oracleId, bucket });
    case 'clm':
      return fetchHistoricalCowcentratedRanges({ vaultId, bucket });
  }

  throw new Error(`Unknown stat: ${stat}`);
}
