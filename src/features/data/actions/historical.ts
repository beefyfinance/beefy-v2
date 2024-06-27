import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyDataApi } from '../apis/instances';
import { isGovVault, type VaultEntity } from '../entities/vault';
import type {
  ApiChartData,
  ApiCowcentratedChartData,
  ApiRanges,
  ApiTimeBucket,
} from '../apis/beefy/beefy-data-api-types';
import { selectIsVaultCowcentratedLike, selectVaultById } from '../selectors/vaults';
import { selectTokenByAddress } from '../selectors/tokens';
import type { TokenEntity } from '../entities/token';
import type { ThunkAction } from 'redux-thunk';
import type { Action } from 'redux';
import type { ChainEntity } from '../entities/chain';
import { featureFlag_simulateBeefyApiError } from '../utils/feature-flags';
import { sleep } from '../utils/async-utils';
import type { ChartStat } from '../../vault/components/HistoricGraph/types';

export interface HistoricalRangesPayload {
  vault: VaultEntity;
  oracleId: TokenEntity['oracleId'];
  ranges: ApiRanges;
  state: BeefyState;
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

  const isCowcentrated = selectIsVaultCowcentratedLike(state, vaultId);

  const ranges = await api.getAvailableRanges(
    vaultId,
    depositToken.oracleId,
    isCowcentrated
      ? isGovVault(vault)
        ? vault.depositTokenAddress
        : vault.contractAddress
      : undefined,
    isCowcentrated ? vault.chainId : undefined
  );

  return { vault, oracleId: depositToken.oracleId, ranges, state };
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
  vaultAddress: VaultEntity['contractAddress'];
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
    const vault = selectVaultById(state, vaultId);
    const api = await getBeefyDataApi();
    const bucketToUse =
      Date.now() / 1000 - vault.createdAt >= 60 * 60 * 24 * 30
        ? bucket
        : ('1h_1M' as ApiTimeBucket);

    // if the vault is a gov vault, we need to use the deposit token address since will be the undelying clm token
    const addressToUse = isGovVault(vault) ? vault.depositTokenAddress : vaultAddress;

    const rawData = await api.getCowcentratedRangesChartData(addressToUse, bucketToUse, chainId);

    const data = rawData.map(item => {
      return {
        ...item,
        v: Number(item.v),
        min: Number(item.min),
        max: Number(item.max),
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
  vaultAddress: VaultEntity['contractAddress']
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
