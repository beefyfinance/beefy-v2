import type { VaultEntity } from '../../entities/vault.ts';
import type { TokenEntity } from '../../entities/token.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type { Duration } from 'date-fns';

export type ApiTimeBucketInterval = '1h' | '1d';
export type ApiTimeBucketRange = '1d' | '1w' | '1M' | '1Y' | 'all';
export type ApiTimeBucket = '1h_1d' | '1h_1w' | '1h_1M' | '1d_1M' | '1d_1Y' | '1d_all';

export type ApiTimeBucketData<TId extends ApiTimeBucket = ApiTimeBucket> = {
  id: TId;
  intervalKey: ApiTimeBucketInterval;
  interval: Duration;
  rangeKey: ApiTimeBucketRange;
  range: Duration;
  maPeriod: Duration;
  available: Duration;
};

export type ApiStat = 'prices' | 'apys' | 'tvls' | 'clm';

export type ApiRange = {
  min: number;
  max: number;
};

export type ApiRanges = {
  [key in ApiStat]: ApiRange;
};

export type ApiPoint = {
  /** unix timestamp */
  t: number;
  /** value */
  v: number;
};

export type ApiCowcentratedPoint = ApiPoint & {
  min: number;
  max: number;
};

export type ApiChartData = ApiPoint[];
export type ApiCowcentratedChartData = ApiCowcentratedPoint[];

export type ApiAvgApy = {
  vault_id: VaultEntity['id'];
  avg_7d: number;
  avg_30d: number;
  avg_90d: number;
};

export type ApiAvgApys = ApiAvgApy[];

export interface IBeefyDataApi {
  getAvailableRanges(
    vaultId: VaultEntity['id'],
    oracleId: TokenEntity['oracleId'],
    vaultAddress?: VaultEntity['contractAddress'],
    chainId?: ChainEntity['id']
  ): Promise<ApiRanges>;

  getTvlChartData(vaultId: VaultEntity['id'], bucket: ApiTimeBucket): Promise<ApiChartData>;

  getApyChartData(vaultId: VaultEntity['id'], bucket: ApiTimeBucket): Promise<ApiChartData>;

  getPriceChartData(
    oracleId: TokenEntity['oracleId'],
    bucket: ApiTimeBucket
  ): Promise<ApiChartData>;

  getCowcentratedRangesChartData(
    vaultAddress: VaultEntity['contractAddress'],
    bucket: ApiTimeBucket,
    chainId: ChainEntity['id']
  ): Promise<ApiCowcentratedChartData>;

  getAvgApys(): Promise<ApiAvgApys>;
}
