import { VaultEntity } from '../../entities/vault';
import { TokenEntity } from '../../entities/token';

export type TimeBucket = '1h_1d' | '1h_1w' | '1d_1M' | '1d_1Y';

export type Stat = 'prices' | 'apys' | 'tvls';

export type Range = {
  min: number;
  max: number;
};

export type Ranges = {
  [key in Stat]: Range;
};

export type HLOC = {
  t: number;
  h: number;
  l: number;
  o: number;
  c: number;
};

export type ChartData = HLOC[];

export interface IBeefyDataApi {
  getAvailableRanges(
    vaultId: VaultEntity['id'],
    oracleId: TokenEntity['oracleId']
  ): Promise<Ranges>;

  getTvlChartData(vaultId: VaultEntity['id'], bucket: TimeBucket): Promise<ChartData>;

  getApyChartData(vaultId: VaultEntity['id'], bucket: TimeBucket): Promise<ChartData>;

  getPriceChartData(oracleId: TokenEntity['oracleId'], bucket: TimeBucket): Promise<ChartData>;
}
