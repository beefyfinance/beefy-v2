import type { ChartStat } from '../../../../data/reducers/historical-types';
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

export type ChartDataPoint =
  | ApiPoint
  | (ApiCowcentratedPoint & { ma: number; ranges?: [number, number] });

export type ChartData = {
  data: ChartDataPoint[];
  min: number;
  max: number;
  avg: number;
};

export function useChartData(
  stat: ChartStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
): ChartData {
  const { startEpoch, maPeriods } = useMemo(() => getBucketParams(bucket), [bucket]);
  const data = useAppSelector(state =>
    selectHistoricalBucketData(state, stat, vaultId, oracleId, bucket)
  );

  // Add Moving Average
  const chartData: ChartData = useMemo(() => {
    if (data && data.length) {
      const values = data.map(d => d.v);
      let min = Math.min(...values);
      let max = Math.max(...values);

      if (stat === 'clm') {
        min = Math.min(...data.map(d => (d as ApiCowcentratedPoint).min));
        max = Math.max(...data.map(d => (d as ApiCowcentratedPoint).max));
      }

      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const ma = new MovingAverage(maPeriods);

      return {
        data: data.map(point => {
          if (stat === 'clm') {
            const { min, max } = point as ApiCowcentratedPoint;
            return { ...point, ma: ma.next(point.v), ranges: [min, max] };
          } else {
            return { ...point, ma: ma.next(point.v) };
          }
        }),
        min,
        max,
        avg,
      };
    }

    return {
      data: [],
      min: 0,
      max: 0,
      avg: 0,
    };
  }, [data, maPeriods, stat]);

  // Remove any extra points that were only there to compute moving average
  return useMemo(() => {
    return {
      ...chartData,
      data: chartData.data.filter(d => d.t >= startEpoch),
    };
  }, [chartData, startEpoch]);
}
