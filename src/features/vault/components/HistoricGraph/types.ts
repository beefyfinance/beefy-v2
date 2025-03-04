import type { EnsureKeys, Prettify } from '../../../data/utils/types-utils.ts';
import type {
  ApiCowcentratedPoint,
  ApiPoint,
} from '../../../data/apis/beefy/beefy-data-api-types.ts';

export type ChartStat = 'apy' | 'tvl' | 'price' | 'clm';

type ChartStatToApiPoint = EnsureKeys<
  ChartStat,
  {
    apy: ApiPoint;
    tvl: ApiPoint;
    price: ApiPoint;
    clm: ApiCowcentratedPoint;
  }
>;

export type AnyApiPoint = ChartStatToApiPoint[keyof ChartStatToApiPoint];

type ChartStatToChartDataPoint = Prettify<{
  apy: ChartStatToApiPoint['apy'] & {
    ma: number;
  };
  tvl: ChartStatToApiPoint['tvl'] & {
    ma: number;
  };
  price: ChartStatToApiPoint['price'] & {
    ma: number;
  };
  clm: ChartStatToApiPoint['clm'] & {
    ma: number;
    ranges: [number, number];
  };
}>;

export type ChartApiPoint<TStat extends ChartStat> = ChartStatToApiPoint[TStat];
export type ChartDataPoint<TStat extends ChartStat> = ChartStatToChartDataPoint[TStat];

export type ChartData<TStat extends ChartStat> = {
  type: TStat;
  data: ChartStatToChartDataPoint[TStat][];
  min: number;
  max: number;
  avg: number;
};
