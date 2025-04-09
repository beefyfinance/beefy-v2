import BigNumber from 'bignumber.js';
import type {
  DatabarnPricesResponse,
  DatabarnPriceType,
  DatabarnTimeBucket,
  DatabarnTimelineEntry,
  IDatabarnApi,
} from './databarn-types.ts';
import type { VaultEntity } from '../../entities/vault.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { getJson } from '../../../../helpers/http/http.ts';
import { isFetchNotFoundError } from '../../../../helpers/http/errors.ts';

export class DatabarnApi implements IDatabarnApi {
  private readonly databarnBase: string;

  constructor() {
    this.databarnBase =
      import.meta.env.VITE_DATABARN_URL || 'https://databarn.beefy.finance/api/v1';
  }

  public async getInvestorTimeline(address: string): Promise<Array<DatabarnTimelineEntry>> {
    try {
      return await getJson<Array<DatabarnTimelineEntry>>({
        url: `${this.databarnBase}/beefy/timeline`,
        params: { address },
      });
    } catch (err) {
      if (isFetchNotFoundError(err)) {
        return [];
      }
      throw err;
    }
  }

  public async getVaultPrices(
    productType: 'vault' | 'boost',
    priceType: DatabarnPriceType,
    timeBucket: DatabarnTimeBucket,
    address: VaultEntity['contractAddress'],
    chain: ChainEntity['id']
  ): Promise<DatabarnPricesResponse> {
    const res = await getJson<Array<[string, string, string, string]>>({
      url: `${this.databarnBase}/price`,
      params: {
        product_key: `beefy:${productType}:${chain}:${address.toLowerCase()}`,
        price_type: priceType,
        time_bucket: timeBucket,
      },
    });

    return res.map(row => {
      return { date: new Date(row[0]), value: new BigNumber(row[1]) };
    });
  }
}
