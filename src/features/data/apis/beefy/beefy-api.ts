import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { isString } from 'lodash-es';
import type { TokenEntity } from '../../entities/token';
import type { VaultEntity } from '../../entities/vault';
import { mapValuesDeep } from '../../utils/array-utils';
import { featureFlag_simulateBeefyApiError } from '../../utils/feature-flags';
import type { TreasuryConfig } from '../config-types';

export type ApyPerformanceFeeData = {
  total: number;
  call: number;
  strategist: number;
  treasury: number;
  stakers: number;
};

export type ApyVaultFeeData = {
  performance: ApyPerformanceFeeData;
  withdraw: number;
  deposit?: number;
  lastUpdated: number;
};

export type ApyFeeData = Record<VaultEntity['id'], ApyVaultFeeData>;

interface ApyGovVault {
  vaultApr: number;
}

interface ApyMaxiVault {
  totalApy: number;
}

export interface ApyStandard {
  beefyPerformanceFee: number;
  vaultApr: number;
  compoundingsPerYear: number;
  vaultApy: number;
  tradingApr?: number;
  composablePoolApr?: number;
  liquidStakingApr?: number;
  totalApy: number;
  // todo: does it make sense to have fees and apy in the same entities?
  lpFee: number;
}

export type ApyData = ApyGovVault | ApyMaxiVault | ApyStandard;

export function isStandardVaultApy(apy: ApyData): apy is ApyStandard {
  return 'compoundingsPerYear' in apy;
}

export function isGovVaultApy(apy: ApyData): apy is ApyGovVault {
  return 'vaultApr' in apy && !('compoundingsPerYear' in apy);
}

export function isMaxiVaultApy(apy: ApyData): apy is ApyMaxiVault {
  return 'totalApy' in apy && !('compoundingsPerYear' in apy);
}

export interface BeefyAPITokenPricesResponse {
  [tokenId: TokenEntity['id']]: number;
}

export interface BeefyAPIApyBreakdownResponse {
  [vaultId: VaultEntity['id']]: ApyData;
}

export interface LpData {
  price: number;
  tokens: string[];
  balances: string[];
  totalSupply: string;
}

export interface BeefyAPILpBreakdownResponse {
  [vaultId: VaultEntity['id']]: LpData;
}

export type BeefyChartDataResponse = {
  name: string;
  ts: string;
  v: number;
}[];

type BeefyApiVaultLastHarvestResponse = Record<string, number>;

export type BeefySnapshotProposal = {
  id: string;
  title: string;
  start: number;
  end: number;
  author: string;
  coreProposal: boolean;
};
export type BeefySnapshotActiveResponse = BeefySnapshotProposal[];

export type BeefyVaultZapSupportResponse = Record<string, ('beefy' | 'oneInch')[]>;

export class BeefyAPI {
  public api: AxiosInstance;

  constructor() {
    // this could be mocked by passing mock axios to the constructor
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'https://api.beefy.finance',
      timeout: 30 * 1000,
    });
  }

  // here we can nicely type the responses
  public async getPrices(): Promise<BeefyAPITokenPricesResponse> {
    if (featureFlag_simulateBeefyApiError('prices')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get('/prices', { params: { _: this.getCacheBuster('short') } });
    return res.data;
  }

  // i'm not 100% certain about the return type
  // are those token ids ?
  public async getLPs(): Promise<BeefyAPITokenPricesResponse> {
    if (featureFlag_simulateBeefyApiError('lps')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get('/lps', { params: { _: this.getCacheBuster('short') } });
    return res.data;
  }

  public async getLpsBreakdown(): Promise<BeefyAPILpBreakdownResponse> {
    if (featureFlag_simulateBeefyApiError('lpsBreakdown')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get('/lps/breakdown', {
      params: { _: this.getCacheBuster('short') },
    });
    return res.data;
  }

  public async getApyBreakdown(): Promise<BeefyAPIApyBreakdownResponse> {
    if (featureFlag_simulateBeefyApiError('apy')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get('/apy/breakdown', {
      params: { _: this.getCacheBuster('short') },
    });

    // somehow, all vaultApr are currently strings, we need to fix that before sending
    // the data to be processed
    const data = mapValuesDeep(res.data, (val, key) => {
      if (key === 'vaultApr' && isString(val)) {
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

  public async getVaultZapSupport(): Promise<BeefyVaultZapSupportResponse> {
    if (featureFlag_simulateBeefyApiError('zap-support')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get<BeefyVaultZapSupportResponse>('/vaults/zap-support', {
      params: { _: this.getCacheBuster('short') },
    });
    return res.data;
  }

  public async getTreasury(): Promise<TreasuryConfig> {
    if (featureFlag_simulateBeefyApiError('treasury')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get<TreasuryConfig>('/treasury', {
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
