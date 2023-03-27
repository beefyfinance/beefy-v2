import axios, { AxiosInstance } from 'axios';
import { ChartData, IBeefyDataApi, Ranges, Stat, TimeBucket } from './beefy-data-api-types';
import { VaultEntity } from '../../entities/vault';
import { TokenEntity } from '../../entities/token';

export class BeefyDataApi implements IBeefyDataApi {
  private readonly version = 'v2';
  private readonly data: AxiosInstance;

  constructor() {
    this.data = axios.create({
      baseURL: `${process.env.REACT_APP_DATA_URL || 'https://data.beefy.finance'}/api/${
        this.version
      }/`,
      timeout: 30 * 1000,
    });
  }

  async getAvailableRanges(
    vaultId: VaultEntity['id'],
    oracleId: TokenEntity['oracleId']
  ): Promise<Ranges> {
    const res = await this.data.get<Ranges>(`ranges/`, {
      params: {
        vault: vaultId,
        oracle: oracleId,
      },
    });

    return res.data;
  }

  async getApyChartData(vaultId: VaultEntity['id'], bucket: TimeBucket): Promise<ChartData> {
    return this.getChartData('apys', 'vault', vaultId, bucket);
  }

  async getPriceChartData(
    oracleId: TokenEntity['oracleId'],
    bucket: TimeBucket
  ): Promise<ChartData> {
    return this.getChartData('prices', 'oracle', oracleId, bucket);
  }

  async getTvlChartData(vaultId: VaultEntity['id'], bucket: TimeBucket): Promise<ChartData> {
    return this.getChartData('tvls', 'vault', vaultId, bucket);
  }

  private async getChartData(
    stat: Stat,
    key: 'vault' | 'oracle',
    value: string,
    bucket: TimeBucket
  ): Promise<ChartData> {
    const res = await this.data.get<ChartData>(`${stat}/`, {
      params: {
        [key]: value,
        bucket,
      },
    });

    return res.data;
  }
}
