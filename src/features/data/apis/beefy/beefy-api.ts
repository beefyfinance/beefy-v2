import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { mapValuesDeep } from '../../utils/array-utils';
import { featureFlag_simulateBeefyApiError } from '../../utils/feature-flags';
import type { TreasuryCompleteBreakdownConfig } from '../config-types';
import type {
  AllCowcentratedVaultRangesResponse,
  ApyFeeData,
  BeefyAPIApyBreakdownResponse,
  BeefyAPILpBreakdownResponse,
  BeefyApiMerklCampaign,
  BeefyAPITokenPricesResponse,
  BeefyApiVaultLastHarvestResponse,
  BeefyLastArticleResponse,
  BeefySnapshotActiveResponse,
  ZapAggregatorTokenSupportResponse,
} from './beefy-api-types';

export const API_URL = import.meta.env.VITE_API_URL || 'https://api.beefy.finance';
export const API_ZAP_URL = import.meta.env.VITE_API_ZAP_URL || `${API_URL}/zap`;

export class BeefyAPI {
  public api: AxiosInstance;
  public timeout = 30 * 1000;

  constructor() {
    // this could be mocked by passing mock axios to the constructor
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30 * 1000,
    });
    this.timeout = 30 * 1000;
  }

  // here we can nicely type the responses
  public async getPrices(): Promise<BeefyAPITokenPricesResponse> {
    if (featureFlag_simulateBeefyApiError('prices')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await fetch(
      `${API_URL}/prices?` + new URLSearchParams({ ['_']: String(this.getCacheBuster('short')) }),
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as BeefyAPITokenPricesResponse;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  // i'm not 100% certain about the return type
  // are those token ids ?
  public async getLPs(): Promise<BeefyAPITokenPricesResponse> {
    if (featureFlag_simulateBeefyApiError('lps')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await fetch(
      `${API_URL}/lps?` + new URLSearchParams({ ['_']: String(this.getCacheBuster('short')) }),
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as BeefyAPITokenPricesResponse;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  public async getLpsBreakdown(): Promise<BeefyAPILpBreakdownResponse> {
    if (featureFlag_simulateBeefyApiError('lpsBreakdown')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await fetch(
      `${API_URL}/lps/breakdown?` +
        new URLSearchParams({ ['_']: String(this.getCacheBuster('short')) }),
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as BeefyAPILpBreakdownResponse;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  public async getApyBreakdown(): Promise<BeefyAPIApyBreakdownResponse> {
    if (featureFlag_simulateBeefyApiError('apy')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await fetch(
      `${API_URL}/apy/breakdown?` +
        new URLSearchParams({ ['_']: String(this.getCacheBuster('short')) }),
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as BeefyAPIApyBreakdownResponse;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }
    const values = await res.json();
    // somehow, all vaultApr are currently strings, we need to fix that before sending
    // the data to be processed
    const data = mapValuesDeep(values, (val, key) => {
      if (key === 'vaultApr' && typeof val === 'string') {
        val = parseFloat(val);
      }
      return val;
    });

    return data;
  }

  /**
   * For now we fetch lastHarvest from the api
   * TODO: fetch this from the contract directly
   */
  public async getVaultLastHarvest(): Promise<BeefyApiVaultLastHarvestResponse> {
    const res = await this.api.get<BeefyApiVaultLastHarvestResponse>('/vaults/last-harvest', {
      params: { _: this.getCacheBuster('short') },
    });

    return res.data;
  }

  public async getFees(): Promise<ApyFeeData> {
    if (featureFlag_simulateBeefyApiError('fees')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get<ApyFeeData>('/fees', {
      params: { _: this.getCacheBuster('short') },
    });
    return res.data;
  }

  public async getZapAggregatorTokenSupport(): Promise<ZapAggregatorTokenSupportResponse> {
    if (featureFlag_simulateBeefyApiError('zap-support')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get<ZapAggregatorTokenSupportResponse>(`${API_ZAP_URL}/swaps`, {
      params: { _: this.getCacheBuster('short') },
    });

    // Handle api->app chain id
    const data = res.data;
    if ('one' in data) {
      data['harmony'] = data['one'] as ZapAggregatorTokenSupportResponse['harmony'];
      delete data['one'];
    }

    return data;
  }

  public async getTreasury(): Promise<TreasuryCompleteBreakdownConfig> {
    if (featureFlag_simulateBeefyApiError('treasury')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get<TreasuryCompleteBreakdownConfig>('/treasury/complete', {
      params: { _: this.getCacheBuster('short') },
    });
    return res.data;
  }

  public async getActiveProposals(): Promise<BeefySnapshotActiveResponse> {
    if (featureFlag_simulateBeefyApiError('snapshot')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get<BeefySnapshotActiveResponse>('/snapshot/active', {
      params: { _: this.getCacheBuster('short') },
    });
    return res.data;
  }

  public async getArticles(): Promise<BeefyLastArticleResponse> {
    if (featureFlag_simulateBeefyApiError('articles')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get<BeefyLastArticleResponse>('/articles/latest', {
      params: { _: this.getCacheBuster('short') },
    });
    return res.data;
  }

  async getAllCowcentratedVaultRanges(): Promise<AllCowcentratedVaultRangesResponse> {
    const res = await this.api.get<AllCowcentratedVaultRangesResponse>('/cow-price-ranges', {
      params: { _: this.getCacheBuster('short') },
    });
    return res.data;
  }

  async getCowcentratedMerklCampaigns(): Promise<BeefyApiMerklCampaign[]> {
    const res = await this.api.get<BeefyApiMerklCampaign[]>('/cow-merkl-campaigns/all/recent', {
      params: { _: this.getCacheBuster('short') },
    });
    return res.data;
  }

  /**
   * @param mode short: minutely / long: hourly
   * @protected
   */
  protected getCacheBuster(mode: 'short' | 'long' = 'short'): number {
    const d = new Date();

    if (mode === 'long') {
      d.setMinutes(0, 0, 0);
    } else {
      d.setSeconds(0, 0);
    }

    return d.getTime();
  }
}
