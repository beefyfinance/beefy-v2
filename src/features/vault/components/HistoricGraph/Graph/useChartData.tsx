import type { VaultEntity } from '../../../../data/entities/vault';
import type { TokenEntity } from '../../../../data/entities/token';
import type {
  ApiCowcentratedPoint,
  ApiTimeBucket,
} from '../../../../data/apis/beefy/beefy-data-api-types';
import { useMemo } from 'react';
import { getBucketParams } from '../utils';
import { useAppSelector } from '../../../../../store';
import { selectHistoricalBucketData } from '../../../../data/selectors/historical';
import { MovingAverage } from '../../../../../helpers/number';
import type { AnyApiPoint, ChartData, ChartStat } from '../types';

function isClmData(
  data: AnyApiPoint[] | undefined,
  stat: ChartStat
): data is ApiCowcentratedPoint[] {
  return !!data && data.length > 0 && 'max' in data[0] && stat === 'clm';
}

export function useChartData<TStat extends ChartStat>(
  stat: TStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
): ChartData<TStat> | undefined {
  const { startEpoch, maPeriods } = useMemo(() => getBucketParams(bucket), [bucket]);
  const data = useAppSelector(state =>
    selectHistoricalBucketData<TStat>(state, stat, vaultId, oracleId, bucket)
  );
  const isCowcentrated = isClmData(data, stat);

  // Add Moving Average
  const chartData = useMemo(() => {
    if (data && data.length) {
      const values = data.map(d => d.v);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const ma = new MovingAverage(maPeriods);

      if (isCowcentrated) {
        return {
          type: stat,
          data: data.map(point => ({
            ...point,
            ma: ma.next(point.v),
            ranges: [point.min, point.max] as [number, number],
          })),
          min: Math.min(...data.map(d => Math.min(d.min, d.v))),
          max: Math.max(...data.map(d => Math.max(d.max, d.v))),
          avg,
        } as ChartData<TStat>;
      }

      return {
        type: stat,
        data: data.map(point => ({ ...point, ma: ma.next(point.v) })),
        min: Math.min(...values),
        max: Math.max(...values),
        avg,
      } as ChartData<TStat>;
    }

    return undefined;
  }, [data, maPeriods, stat, isCowcentrated]);

  // Remove any extra points that were only there to compute moving average
  return useMemo(
    () =>
      chartData
        ? {
            ...chartData,
            data: chartData.data.filter(d => d.t >= startEpoch),
          }
        : undefined,
    [chartData, startEpoch]
  );
}
