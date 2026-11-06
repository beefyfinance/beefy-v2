import { getBeefyDataApi } from '../apis/instances.ts';
import { getBucketParams } from '../apis/beefy/beefy-data-api-helpers.ts';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { sumChainTvl, type TimePointWithMa, withMovingAverage } from '../utils/platform-stats.ts';

export type TvlHistoryBucket = Extract<ApiTimeBucket, '1d_1M' | '1d_1Y'>;

interface TvlHistoryPayload {
  bucket: TvlHistoryBucket;
  points: TimePointWithMa[];
}

async function fetchTvlHistory(
  bucket: TvlHistoryBucket,
  chainsById: Partial<Record<string, ChainEntity>>
): Promise<TvlHistoryPayload> {
  const api = await getBeefyDataApi();
  const { data } = await api.getTvlByChains(bucket);
  const { startEpoch, maPeriods } = getBucketParams(bucket);
  return {
    bucket,
    points: withMovingAverage(sumChainTvl(data, chainsById), maPeriods, startEpoch),
  };
}

export const fetchTvlHistoryMonth = createAppAsyncThunk<TvlHistoryPayload>(
  'tvlHistory/fetchMonth',
  async (_, { getState }) => fetchTvlHistory('1d_1M', getState().entities.chains.byId)
);

export const fetchTvlHistoryYear = createAppAsyncThunk<TvlHistoryPayload>(
  'tvlHistory/fetchYear',
  async (_, { getState }) => fetchTvlHistory('1d_1Y', getState().entities.chains.byId)
);
