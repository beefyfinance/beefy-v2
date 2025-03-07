import { mapValuesDeep } from '../../utils/array-utils.ts';
import { featureFlag_simulateBeefyApiError } from '../../utils/feature-flags.ts';
import type { TreasuryCompleteBreakdownConfig } from '../config-types.ts';
import type {
  AllCowcentratedVaultRangesResponse,
  ApyFeeData,
  BeefyAPIApyBreakdownResponse,
  BeefyAPILpBreakdownResponse,
  BeefyAPITokenPricesResponse,
  BeefyApiVaultLastHarvestResponse,
  BeefyLastArticleResponse,
  BeefyOffChainRewardsCampaign,
  BeefySnapshotActiveResponse,
  ZapAggregatorTokenSupportResponse,
} from './beefy-api-types.ts';
import { getJson } from '../../../../helpers/http/http.ts';

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

    return await getJson<BeefyAPITokenPricesResponse>({
      url: `${this.api}/prices`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });
  }

  // i'm not 100% certain about the return type
  // are those token ids ?
  public async getLPs(): Promise<BeefyAPITokenPricesResponse> {
    if (featureFlag_simulateBeefyApiError('lps')) {
      throw new Error('Simulated beefy api error');
    }

    return await getJson<BeefyAPITokenPricesResponse>({
      url: `${this.api}/lps`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });
  }

  public async getLpsBreakdown(): Promise<BeefyAPILpBreakdownResponse> {
    if (featureFlag_simulateBeefyApiError('lpsBreakdown')) {
      throw new Error('Simulated beefy api error');
    }

    return await getJson<BeefyAPILpBreakdownResponse>({
      url: `${this.api}/lps/breakdown`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });
  }

  public async getApyBreakdown(): Promise<BeefyAPIApyBreakdownResponse> {
    if (featureFlag_simulateBeefyApiError('apy')) {
      throw new Error('Simulated beefy api error');
    }

    const values = await getJson<BeefyAPIApyBreakdownResponse>({
      url: `${this.api}/apy/breakdown`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });

    // somehow, all vaultApr are currently strings, we need to fix that before sending
    // the data to be processed
    return mapValuesDeep(values, (val, key) => {
      if (val === 'Infinity') {
        return Infinity;
      }
      if (val === '-Infinity') {
        return -Infinity;
      }
      if (key === 'vaultApr' && typeof val === 'string') {
        return parseFloat(val);
      }
      return val;
    }) as BeefyAPIApyBreakdownResponse;
  }

  /**
   * For now we fetch lastHarvest from the api
   * TODO: fetch this from the contract directly
   */
  public async getVaultLastHarvest(): Promise<BeefyApiVaultLastHarvestResponse> {
    return await getJson<BeefyApiVaultLastHarvestResponse>({
      url: `${this.api}/vaults/last-harvest`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });
  }

  public async getFees(): Promise<ApyFeeData> {
    if (featureFlag_simulateBeefyApiError('fees')) {
      throw new Error('Simulated beefy api error');
    }
    return await getJson<ApyFeeData>({
      url: `${this.api}/fees`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });
  }

  public async getZapAggregatorTokenSupport(): Promise<ZapAggregatorTokenSupportResponse> {
    if (featureFlag_simulateBeefyApiError('zap-support')) {
      throw new Error('Simulated beefy api error');
    }
    const data = await getJson<ZapAggregatorTokenSupportResponse>({
      url: `${this.zapApi}/swaps`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });

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

    return await getJson<TreasuryCompleteBreakdownConfig>({
      url: `${this.api}/treasury/complete`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });
  }

  public async getActiveProposals(): Promise<BeefySnapshotActiveResponse> {
    if (featureFlag_simulateBeefyApiError('snapshot')) {
      throw new Error('Simulated beefy api error');
    }
    return await getJson<BeefySnapshotActiveResponse>({
      url: `${this.api}/snapshot/active`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });
  }

  public async getArticles(): Promise<BeefyLastArticleResponse> {
    if (featureFlag_simulateBeefyApiError('articles')) {
      throw new Error('Simulated beefy api error');
    }

    return await getJson<BeefyLastArticleResponse>({
      url: `${this.api}/articles/latest`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });
  }

  async getAllCowcentratedVaultRanges(): Promise<AllCowcentratedVaultRangesResponse> {
    return await getJson<AllCowcentratedVaultRangesResponse>({
      url: `${this.api}/cow-price-ranges`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });
  }

  async getOffChainRewardCampaigns(): Promise<BeefyOffChainRewardsCampaign[]> {
    return await getJson<BeefyOffChainRewardsCampaign[]>({
      url: `${this.api}/offchain-rewards/active`,
      cacheBuster: 'short',
      timeout: this.timeout,
    });
  }
}
