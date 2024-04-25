import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyDataApi } from '../apis/instances';
import {
  isCowcentratedLiquidityVault,
  type VaultCowcentrated,
  type VaultEntity,
} from '../entities/vault';
import type {
  ApiChartData,
  ApiCowcentratedChartData,
  ApiRanges,
  ApiTimeBucket,
} from '../apis/beefy/beefy-data-api-types';
import { selectVaultById } from '../selectors/vaults';
import { selectTokenByAddress } from '../selectors/tokens';
import type { TokenEntity } from '../entities/token';
import type { ThunkAction } from 'redux-thunk';
import type { Action } from 'redux';
import type { ChartStat } from '../reducers/historical-types';
import type { ChainEntity } from '../entities/chain';
import BigNumber from 'bignumber.js';

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
  let ranges = {
    apys: { min: 0, max: 0 },
    prices: { min: 0, max: 0 },
    tvls: { min: 0, max: 0 },
    clm: { min: 0, max: 0 },
  } satisfies ApiRanges;

  if (isCowcentratedLiquidityVault(vault)) {
    ranges = await api.getAvailableRanges(
      vaultId,
      depositToken.oracleId,
      vault.earnContractAddress,
      vault.chainId
    );
  } else {
    ranges = await api.getAvailableRanges(vaultId, depositToken.oracleId);
  }

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

export interface HistoricalCowcentratedPayload {
  data: ApiCowcentratedChartData;
}

export interface HistoricalCowcentratedParams {
  vaultId: VaultEntity['id'];
  vaultAddress: VaultEntity['earnContractAddress'];
  chainId: ChainEntity['id'];
  bucket: ApiTimeBucket;
}

export const fetchHistoricalCowcentratedRanges = createAsyncThunk<
  HistoricalCowcentratedPayload,
  HistoricalCowcentratedParams,
  { state: BeefyState }
>(
  'historical/fetchHistoricalCowcentratedRanges',
  async ({ vaultAddress, chainId, bucket, vaultId }, { getState }) => {
    const state = getState();
    const vault = selectVaultById(state, vaultId) as VaultCowcentrated;
    const api = await getBeefyDataApi();
    const bucketToUse =
      Date.now() / 1000 - vault.createdAt >= 60 * 60 * 24 * 30
        ? bucket
        : ('1h_1M' as ApiTimeBucket);
    const rawData = await api.getCowcentratedRangesChartData(vaultAddress, bucketToUse, chainId);

    const token0 = selectTokenByAddress(state, chainId, vault.depositTokenAddresses[0]);
    const token1 = selectTokenByAddress(state, chainId, vault.depositTokenAddresses[1]);

    const data = rawData.map(item => {
      return {
        ...item,
        v: Number(decimalTranslateFunction(item.v, token0.decimals, token1.decimals)),
        min: Number(decimalTranslateFunction(item.min, token0.decimals, token1.decimals)),
        max: Number(decimalTranslateFunction(item.max, token0.decimals, token1.decimals)),
      };
    }) satisfies ApiCowcentratedChartData;

    return { data };
  }
);

export function fetchHistoricalStat(
  stat: ChartStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket,
  chainId: ChainEntity['id'],
  vaultAddress: VaultEntity['earnContractAddress']
): ThunkAction<unknown, unknown, unknown, Action<unknown>> {
  switch (stat) {
    case 'apy':
      return fetchHistoricalApys({ vaultId, bucket });
    case 'tvl':
      return fetchHistoricalTvls({ vaultId, bucket });
    case 'price':
      return fetchHistoricalPrices({ oracleId, bucket });
    case 'clm':
      return fetchHistoricalCowcentratedRanges({ vaultId, vaultAddress, chainId, bucket });
  }

  throw new Error(`Unknown stat: ${stat}`);
}

const decimalTranslateFunction = (value: number, decimal0: number, decimal1: number) => {
  return new BigNumber(value).shiftedBy(decimal0 - decimal1).toString(10);
};
