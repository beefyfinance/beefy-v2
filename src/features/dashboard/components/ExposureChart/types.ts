import type {
  ChainExposurePayloadData,
  GenericExposurePayloadData,
  TokenExposurePayloadData,
} from '../../../../components/PieChart/types.ts';

type BaseExposureDashboardChartProps = {
  title?: string;
};

type TokenExposurePieChartProps = BaseExposureDashboardChartProps & {
  type: 'token';
  data: TokenExposurePayloadData[];
};

type ChainExposurePieChartProps = BaseExposureDashboardChartProps & {
  type: 'chain';
  data: ChainExposurePayloadData[];
};

type PlatformExposurePieChartProps = BaseExposureDashboardChartProps & {
  type: 'platform';
  data: GenericExposurePayloadData[];
};

export type ExposureDashboardChartProps =
  | TokenExposurePieChartProps
  | ChainExposurePieChartProps
  | PlatformExposurePieChartProps;

export interface ExposureDashboardChartLoaderProps {
  title?: string;
  address: string;
}
