import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../features/data/entities/chain.ts';

export type TokenExposurePayloadData = {
  key: string;
  label: string;
  value: BigNumber;
  percentage: number;
  chainId: ChainEntity['id'];
  symbols: string[];
};

export type ChainExposurePayloadData = {
  key: string;
  label: string;
  value: BigNumber;
  percentage: number;
  chainId: 'others' | ChainEntity['id'];
};

export type GenericExposurePayloadData = {
  key: string;
  label?: string;
  value: BigNumber;
  percentage: number;
};

export type PieChartPayloadData =
  | TokenExposurePayloadData
  | ChainExposurePayloadData
  | GenericExposurePayloadData;

type BasePieChartProps = {
  formatter?: (s: string) => string;
};

export type PieChartType = 'chain' | 'platform' | 'token' | 'assetAvailability' | 'generic';

export type TokenExposurePieChartProps = BasePieChartProps & {
  type: 'token';
  data: TokenExposurePayloadData[];
};

export type ChainExposurePieChartProps = BasePieChartProps & {
  type: 'chain';
  data: ChainExposurePayloadData[];
};

export type GenericExposurePieChartProps = BasePieChartProps & {
  type: Exclude<PieChartType, 'chain' | 'token'>;
  data: GenericExposurePayloadData[];
};

export type PieChartProps =
  | TokenExposurePieChartProps
  | ChainExposurePieChartProps
  | GenericExposurePieChartProps;
