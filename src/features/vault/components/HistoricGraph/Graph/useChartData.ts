import { useMemo } from 'react';
import { minMaxAverage } from '../../../../../helpers/collection.ts';
import { MovingAverage } from '../../../../../helpers/number.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import type {
  ApiCowcentratedPoint,
  ApiPoint,
  ApiTimeBucket,
} from '../../../../data/apis/beefy/beefy-data-api-types.ts';
import type { TokenEntity } from '../../../../data/entities/token.ts';
import type { VaultEntity } from '../../../../data/entities/vault.ts';
import { selectHistoricalBucketData } from '../../../../data/selectors/historical.ts';
import type { AnyApiPoint, ChartData, ChartStat } from '../types.ts';
import { getBucketParams } from '../utils.ts';

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
  bucket: ApiTimeBucket,
  inverted: boolean
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
            v: inverted ? 1 / point.v : point.v,
            min: inverted ? 1 / point.max : point.min,
            max: inverted ? 1 / point.min : point.max,
            ma: inverted ? 1 / ma.next(point.v) : ma.next(point.v),
            ranges:
              inverted ?
                ([1 / point.max, 1 / point.min] as [number, number])
              : ([point.min, point.max] as [number, number]),
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
  }, [data, maPeriods, stat, inverted, startEpoch]);
}
