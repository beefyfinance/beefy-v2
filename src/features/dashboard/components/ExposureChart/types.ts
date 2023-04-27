import type BigNumber from 'bignumber.js';

export interface ExposureDashboardChartProps {
  title?: string;
  data: { key: string; value: BigNumber; percentage: number }[];
  type: 'chain' | 'platform' | 'token';
}

export interface ExposureDashboardChartLoaderProps {
  title?: string;
}
