import { ChartStat } from '../../../../data/reducers/historical-types';
import { VaultEntity } from '../../../../data/entities/vault';
import { TokenEntity } from '../../../../data/entities/token';
import { HLOC, TimeBucket } from '../../../../data/apis/beefy/beefy-data-api-types';
import { useMemo } from 'react';
import { getBucketParams } from '../utils';
import { useAppSelector } from '../../../../../store';
import { selectHistoricalBucketData } from '../../../../data/selectors/historical';
import { MovingAverage } from '../../../../../helpers/number';

export type ChartDataPoint = HLOC & { ma: number };

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
  bucket: TimeBucket
): ChartData {
  const { startEpoch, maPeriods } = useMemo(() => getBucketParams(bucket), [bucket]);
  const data = useAppSelector(state =>
    selectHistoricalBucketData(state, stat, vaultId, oracleId, bucket)
  );

  // Add Moving Average
  const chartData: ChartData = useMemo(() => {
    if (data && data.length) {
      const highs = data.map(d => d.h);
      const min = Math.min(...highs);
      const max = Math.max(...highs);
      const avg = highs.reduce((a, b) => a + b, 0) / highs.length;
      const ma = new MovingAverage(maPeriods);

      return {
        data: data.map(point => ({ ...point, ma: ma.next(point.h) })),
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
  }, [data, maPeriods]);

  // Remove any extra points that were only there to compute moving average
  return useMemo(() => {
    return {
      ...chartData,
      data: chartData.data.filter(d => d.t >= startEpoch),
    };
  }, [chartData, startEpoch]);
}
