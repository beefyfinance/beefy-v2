import type {
  ApiAvgApys,
  ApiChartData,
  ApiCowcentratedChartData,
  ApiRanges,
  ApiStat,
  ApiTimeBucket,
  IBeefyDataApi,
} from './beefy-data-api-types.ts';
import type { VaultEntity } from '../../entities/vault.ts';
import type { TokenEntity } from '../../entities/token.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { getJson } from '../../../../helpers/http/http.ts';

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
        vaultAddress: vaultAddress,
        chain: chainId,
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

  async getAvgApys(): Promise<ApiAvgApys> {
    return await getJson<ApiAvgApys>({
      url: `${this.data}/apys/avg`,
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
