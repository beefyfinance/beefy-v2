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
import { handleFetchParams } from '../transact/helpers/fetch';

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
    const res = await fetch(
      `${this.data}/ranges?${handleFetchParams({
        vault: vaultId,
        oracle: oracleId,
        vaultAddress: vaultAddress || '',
        chain: chainId || '',
      })}`
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as ApiRanges;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
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
    const res = await fetch(
      `${this.data}/clmRanges?${handleFetchParams({
        vaultAddress,
        chain: chainId,
        bucket,
      })}`
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as ApiCowcentratedChartData;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  private async getChartData(
    stat: ApiStat,
    key: 'vault' | 'oracle',
    value: string,
    bucket: ApiTimeBucket
  ): Promise<ApiChartData> {
    const res = await fetch(
      `${this.data}/${stat}?${handleFetchParams({
        [key]: value,
        bucket,
      })}`
    );

    if (!res.ok) {
      if (res.status === 404) {
        return [] as ApiChartData;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }
}
