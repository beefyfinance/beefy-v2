import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyDataApi } from '../apis/instances';
import type { VaultEntity } from '../entities/vault';
import type { ApiChartData, ApiRanges, ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import { selectVaultById } from '../selectors/vaults';
import { selectTokenByAddress } from '../selectors/tokens';
import type { TokenEntity } from '../entities/token';
import type { ThunkAction } from 'redux-thunk';
import type { Action } from 'redux';
import type { ChartStat } from '../reducers/historical-types';

export interface HistoricalRangesPayload {
  vaultId: VaultEntity['id'];
  oracleId: TokenEntity['oracleId'];
  ranges: ApiRanges;
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
  const ranges = await api.getAvailableRanges(vaultId, depositToken.oracleId);

  return { vaultId, oracleId: depositToken.oracleId, ranges };
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
  const api = await getBeefyDataApi();
  const data = await api.getPriceChartData(oracleId, bucket);

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
  }

  throw new Error(`Unknown stat: ${stat}`);
}
