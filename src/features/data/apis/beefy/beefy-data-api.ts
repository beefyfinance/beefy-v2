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
import { getJson } from '../../../../helpers/http';

export class BeefyDataApi implements IBeefyDataApi {
  private readonly version = 'v2';
  private readonly data: string;

  constructor() {
    this.data = `${import.meta.env.VITE_DATA_URL || 'https://data.beefy.finance'}/api/${
      this.version
    }`;
  }

  async getAvailableRanges(
    vaultId: VaultEntity['id'],
    oracleId: TokenEntity['oracleId'],
    vaultAddress?: VaultEntity['contractAddress'],
    chainId?: ChainEntity['id']
  ): Promise<ApiRanges> {
    return await getJson<ApiRanges>({
      url: `${this.data}/ranges`,
      params: {
        vault: vaultId,
        oracle: oracleId,
        vaultAddress: vaultAddress || '',
        chain: chainId || '',
      },
    });
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
    vaultAddress: VaultEntity['contractAddress'],
    bucket: ApiTimeBucket,
    chainId: ChainEntity['id']
  ): Promise<ApiCowcentratedChartData> {
    return await getJson<ApiCowcentratedChartData>({
      url: `${this.data}/clmRanges`,
      params: { vaultAddress, chain: chainId, bucket },
    });
  }

  private async getChartData(
    stat: ApiStat,
    key: 'vault' | 'oracle',
    value: string,
    bucket: ApiTimeBucket
  ): Promise<ApiChartData> {
    return await getJson<ApiChartData>({
      url: `${this.data}/${stat}`,
      params: { [key]: value, bucket },
    });
  }
}
