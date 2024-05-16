import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type {
  ApiChartData,
  IBeefyDataApi,
  ApiRanges,
  ApiStat,
  ApiTimeBucket,
  ApiCowcentratedChartData,
} from './beefy-data-api-types';
import type { VaultEntity } from '../../entities/vault';
import type { TokenEntity } from '../../entities/token';
import type { ChainEntity } from '../../entities/chain';

export class BeefyDataApi implements IBeefyDataApi {
  private readonly version = 'v2';
  private readonly data: AxiosInstance;

  constructor() {
    this.data = axios.create({
      baseURL: `${import.meta.env.VITE_DATA_URL || 'https://data.beefy.finance'}/api/${
        this.version
      }/`,
      timeout: 30 * 1000,
    });
  }

  async getAvailableRanges(
    vaultId: VaultEntity['id'],
    oracleId: TokenEntity['oracleId'],
    vaultAddress?: VaultEntity['earnContractAddress'],
    chainId?: ChainEntity['id']
  ): Promise<ApiRanges> {
    const res = await this.data.get<ApiRanges>(`ranges/`, {
      params: {
        vault: vaultId,
        oracle: oracleId,
        vaultAddress,
        chain: chainId,
      },
    });

    return res.data;
  }

  async getApyChartData(vaultId: VaultEntity['id'], bucket: ApiTimeBucket): Promise<ApiChartData> {
    return this.getChartData('apys', 'vault', vaultId, bucket);
  }

  async getPriceChartData(
    oracleId: TokenEntity['oracleId'],
    bucket: ApiTimeBucket
  ): Promise<ApiChartData> {
    return this.getChartData('prices', 'oracle', oracleId, bucket);
  }

  async getTvlChartData(vaultId: VaultEntity['id'], bucket: ApiTimeBucket): Promise<ApiChartData> {
    return this.getChartData('tvls', 'vault', vaultId, bucket);
  }

  async getCowcentratedRangesChartData(
    vaultAddress: VaultEntity['earnContractAddress'],
    bucket: ApiTimeBucket,
    chainId: ChainEntity['id']
  ): Promise<ApiCowcentratedChartData> {
    const res = await this.data.get<ApiCowcentratedChartData>(`clmRanges/`, {
      params: {
        vaultAddress,
        chain: chainId,
        bucket,
      },
    });

    return res.data;
  }

  private async getChartData(
    stat: ApiStat,
    key: 'vault' | 'oracle',
    value: string,
    bucket: ApiTimeBucket
  ): Promise<ApiChartData> {
    const res = await this.data.get<ApiChartData>(`${stat}/`, {
      params: {
        [key]: value,
        bucket,
      },
    });

    return res.data;
  }
}
