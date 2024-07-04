import type { VaultEntity } from '../../../../data/entities/vault';
import type { TokenEntity } from '../../../../data/entities/token';
import type {
  ApiCowcentratedPoint,
  ApiPoint,
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

function minMaxAverage<K extends string, T extends Record<K, number>>(
  values: T[],
  avgKey: K,
  minKeys: Array<K>,
  maxKeys: Array<K>
): { avg: number; min: number; max: number } {
  const avg = values.reduce((a, b) => (a + b[avgKey]) as number, 0) / values.length;
  const min = values.reduce((a, b) => Math.min(a, ...minKeys.map(k => b[k] as number)), Infinity);
  const max = values.reduce((a, b) => Math.max(a, ...maxKeys.map(k => b[k] as number)), -Infinity);
  return { avg, min, max };
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

  return useMemo(() => {
    if (data && data.length) {
      const ma = new MovingAverage(maPeriods);

      if (stat === 'clm' && isClmData(data, stat)) {
        // Add Moving Average then remove extra points
        const dataWithMa = data
          .map(point => ({
            ...point,
            ma: ma.next(point.v),
            ranges: [point.min, point.max] as [number, number],
          }))
          .filter(d => d.t >= startEpoch);

        return {
          type: stat,
          data: dataWithMa,
          ...minMaxAverage(dataWithMa, 'v', ['v', 'min', 'ma'], ['v', 'max', 'ma']),
        } as ChartData<TStat>;
      }

      // Add Moving Average then remove extra points
      const dataWithMa = (data as ApiPoint[])
        .map(point => ({ ...point, ma: ma.next(point.v) }))
        .filter(d => d.t >= startEpoch);

      return {
        type: stat,
        data: dataWithMa,
        ...minMaxAverage(dataWithMa, 'v', ['v', 'ma'], ['v', 'ma']),
      } as ChartData<TStat>;
    }

    return undefined;
  }, [data, maPeriods, stat, startEpoch]);
}
