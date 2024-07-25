import { mapValuesDeep } from '../../utils/array-utils';
import { featureFlag_simulateBeefyApiError } from '../../utils/feature-flags';
import type { TreasuryCompleteBreakdownConfig } from '../config-types';
import { handleFetchParams } from '../transact/helpers/fetch';
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
  public api: string;
  public zapApi: string;
  public timeout: number;

  constructor() {
    this.api = API_URL;
    this.zapApi = API_ZAP_URL;
    this.timeout = 30 * 1000;
  }

  // here we can nicely type the responses
  public async getPrices(): Promise<BeefyAPITokenPricesResponse> {
    if (featureFlag_simulateBeefyApiError('prices')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await fetch(
      `${this.api}/prices?${handleFetchParams({ ['_']: String(this.getCacheBuster('short')) })}`,
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
      `${this.api}/lps?${handleFetchParams({ ['_']: String(this.getCacheBuster('short')) })}`,
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
      `${this.api}/lps/breakdown?${handleFetchParams({
        ['_']: String(this.getCacheBuster('short')),
      })}`,
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
      `${this.api}/apy/breakdown?${handleFetchParams({
        ['_']: String(this.getCacheBuster('short')),
      })}`,
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
    const res = await fetch(
      `${this.api}/vaults/last-harvest?${handleFetchParams({
        ['_']: String(this.getCacheBuster('short')),
      })}`,
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as BeefyApiVaultLastHarvestResponse;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  public async getFees(): Promise<ApyFeeData> {
    if (featureFlag_simulateBeefyApiError('fees')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await fetch(
      `${this.api}/fees?${handleFetchParams({ ['_']: String(this.getCacheBuster('short')) })}`,
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as ApyFeeData;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  public async getZapAggregatorTokenSupport(): Promise<ZapAggregatorTokenSupportResponse> {
    if (featureFlag_simulateBeefyApiError('zap-support')) {
      throw new Error('Simulated beefy api error');
    }
    const res = await fetch(
      `${this.zapApi}/swaps?${handleFetchParams({ ['_']: String(this.getCacheBuster('short')) })}`,
      {
        signal: AbortSignal.timeout(this.timeout),
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as ZapAggregatorTokenSupportResponse;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Handle api->app chain id
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

    const res = await fetch(
      `${this.api}/treasury/complete?${handleFetchParams({
        ['_']: String(this.getCacheBuster('short')),
      })}`,
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as TreasuryCompleteBreakdownConfig;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  public async getActiveProposals(): Promise<BeefySnapshotActiveResponse> {
    if (featureFlag_simulateBeefyApiError('snapshot')) {
      throw new Error('Simulated beefy api error');
    }
    const res = await fetch(
      `${this.api}/snapshot/active?${handleFetchParams({
        ['_']: String(this.getCacheBuster('short')),
      })}`,
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as BeefySnapshotActiveResponse;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  public async getArticles(): Promise<BeefyLastArticleResponse> {
    if (featureFlag_simulateBeefyApiError('articles')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await fetch(
      `${this.api}/articles/latest?${handleFetchParams({
        ['_']: String(this.getCacheBuster('short')),
      })}`,
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as BeefyLastArticleResponse;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  async getAllCowcentratedVaultRanges(): Promise<AllCowcentratedVaultRangesResponse> {
    const res = await fetch(
      `${this.api}/cow-price-ranges?${handleFetchParams({
        ['_']: String(this.getCacheBuster('short')),
      })}`,
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return {} as AllCowcentratedVaultRangesResponse;
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  }

  async getCowcentratedMerklCampaigns(): Promise<BeefyApiMerklCampaign[]> {
    const res = await fetch(
      `${this.api}/cow-merkl-campaigns/all/recent?${handleFetchParams({
        ['_']: String(this.getCacheBuster('short')),
      })}`,
      { signal: AbortSignal.timeout(this.timeout) }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return [] as BeefyApiMerklCampaign[];
      }
      // throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
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
