import { sub } from 'date-fns';
import { isMoreThanDurationAgoUnix } from '../../../helpers/date.ts';
import type { ChartStat } from '../../vault/components/HistoricGraph/types.ts';
import { getDataApiBucket } from '../apis/beefy/beefy-data-api-helpers.ts';
import type {
  ApiChartData,
  ApiCowcentratedChartData,
  ApiRanges,
  ApiTimeBucket,
} from '../apis/beefy/beefy-data-api-types.ts';
import { isClmPriceHistoryEntriesClm } from '../apis/clm/clm-api-typeguards.ts';
import type { ClmPriceHistoryEntryClm } from '../apis/clm/clm-api-types.ts';
import { getBeefyDataApi, getClmApi } from '../apis/instances.ts';
import type { TokenEntity } from '../entities/token.ts';
import { isCowcentratedLikeVault, type VaultEntity } from '../entities/vault.ts';
import { selectTokenByAddress } from '../selectors/tokens.ts';
import { selectCowcentratedLikeVaultById, selectVaultById } from '../selectors/vaults.ts';
import type { BeefyThunk } from '../store/types.ts';
import { sleep } from '../utils/async-utils.ts';
import { featureFlag_simulateBeefyApiError } from '../utils/feature-flags.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { getCowcentratedAddressFromCowcentratedLikeVault } from '../utils/vault-utils.ts';

export interface HistoricalRangesPayload {
  vaultId: VaultEntity['id'];
  oracleId: TokenEntity['oracleId'];
  ranges: ApiRanges;
  isCowcentrated: boolean;
}

export interface HistoricalRangesParams {
  vaultId: VaultEntity['id'];
}

export const fetchHistoricalRanges = createAppAsyncThunk<
  HistoricalRangesPayload,
  HistoricalRangesParams
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

export const fetchHistoricalApys = createAppAsyncThunk<HistoricalApysPayload, HistoricalApysParams>(
  'historical/fetchHistoricalApys',
  async ({ vaultId, bucket }) => {
    const api = await getBeefyDataApi();
    const data = await api.getApyChartData(vaultId, bucket);

    return { data };
  }
);

export interface HistoricalTvlsPayload {
  data: ApiChartData;
}

export interface HistoricalTvlsParams {
  vaultId: VaultEntity['id'];
  bucket: ApiTimeBucket;
}

export const fetchHistoricalTvls = createAppAsyncThunk<HistoricalTvlsPayload, HistoricalTvlsParams>(
  'historical/fetchHistoricalTvls',
  async ({ vaultId, bucket }) => {
    const api = await getBeefyDataApi();
    const data = await api.getTvlChartData(vaultId, bucket);

    return { data };
  }
);

export interface HistoricalPricesPayload {
  data: ApiChartData;
}

export interface HistoricalPricesParams {
  oracleId: TokenEntity['oracleId'];
  bucket: ApiTimeBucket;
}

export const fetchHistoricalPrices = createAppAsyncThunk<
  HistoricalPricesPayload,
  HistoricalPricesParams
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
  rawData: ClmPriceHistoryEntryClm[];
}

export interface HistoricalCowcentratedParams {
  vaultId: VaultEntity['id'];
  bucket: ApiTimeBucket;
}

export const fetchHistoricalCowcentratedRanges = createAppAsyncThunk<
  HistoricalCowcentratedPayload,
  HistoricalCowcentratedParams
>('historical/fetchHistoricalCowcentratedRanges', async ({ bucket, vaultId }, { getState }) => {
  const state = getState();
  const vault = selectCowcentratedLikeVaultById(state, vaultId);
  const api = await getClmApi();
  const bucketToUse =
    isMoreThanDurationAgoUnix(vault.createdAt, { days: 30 }) ? bucket : ('1h_1M' as const);
  const { range, maPeriod } = getDataApiBucket(bucketToUse);
  const clmPeriod = bucketToUse.split('_')[0] as typeof bucketToUse extends `${infer T}_${string}` ?
    T
  : never;

  const clmAddress = getCowcentratedAddressFromCowcentratedLikeVault(vault);
  const rawData = await api.getPriceHistoryForVaultSince(
    vault.chainId,
    clmAddress,
    sub(sub(new Date(), range), maPeriod),
    clmPeriod
  );

  if (rawData.length === 0) {
    return { data: [], rawData: [] };
  }

  if (!isClmPriceHistoryEntriesClm(rawData)) {
    throw new Error('Expected CLM price history entries');
  }

  return {
    data: rawData.map(item => {
      return {
        t: item.timestamp,
        v: Number(item.currentPrice),
        min: Number(item.rangeMin),
        max: Number(item.rangeMax),
      };
    }),
    rawData,
  };
});

export function fetchHistoricalStat(
  stat: ChartStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
): BeefyThunk {
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
