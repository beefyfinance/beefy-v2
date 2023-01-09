import axios, { AxiosInstance } from 'axios';
import BigNumber from 'bignumber.js';
import { isString } from 'lodash';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';
import { mapValuesDeep } from '../utils/array-utils';
import { featureFlag_simulateBeefyApiError } from '../utils/feature-flags';
import { TreasuryConfig } from './config-types';

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

export interface BeefyAPIBuybackResponse {
  // those are of type string but they represent numbers
  [chainId: ChainEntity['id']]: { buybackTokenAmount: BigNumber; buybackUsdAmount: BigNumber };
}

export type BeefyChartDataResponse = {
  name: string;
  ts: string;
  v: number;
}[];

// note that there is more infos but we don't need it
type BeefyAPIVaultsResponse = {
  id: string;
  lastHarvest?: number | string;
}[];

export class BeefyAPI {
  public api: AxiosInstance;
  public data: AxiosInstance;

  constructor() {
    // this could be mocked by passing mock axios to the constructor
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'https://api.beefy.finance',
      timeout: 30 * 1000,
    });
    this.data = axios.create({
      baseURL: process.env.REACT_APP_DATA_URL || 'https://data.beefy.finance',
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

  public async getBuyBack(): Promise<BeefyAPIBuybackResponse> {
    if (featureFlag_simulateBeefyApiError('buyback')) {
      throw new Error('Simulated beefy api error');
    }

    type ResponseType = {
      data: {
        [chainId: ChainEntity['id']]: {
          buybackTokenAmount: string;
          buybackUsdAmount: string;
        };
      };
    };
    const strRes = await this.api.get<ResponseType>('/bifibuyback', {
      params: { _: this.getCacheBuster('long') },
    });
    // format result with big number as we get strings from the api
    const res: BeefyAPIBuybackResponse = {};
    for (const chainId in strRes.data) {
      res[chainId] = {
        buybackTokenAmount: new BigNumber(strRes.data[chainId].buybackTokenAmount),
        buybackUsdAmount: new BigNumber(strRes.data[chainId].buybackUsdAmount),
      };
    }
    return res;
  }

  /**
   * For now we fetch lastHarvest from the api
   * TODO: fetch this from the contract directly
   */
  public async getVaultLastHarvest(vaultId: VaultEntity['id']): Promise<null | Date> {
    const res = await this.api.get<BeefyAPIVaultsResponse>('/vaults', {
      params: { _: this.getCacheBuster('short') },
    });

    // const vault = data.filter(vault => vault.id.includes(vaultId));
    const vaultConfig = res.data.find(vault => {
      return vault.id === vaultId;
    });

    if (!vaultConfig) {
      // vault is not harvestable (most probably a gov vault)
      return null;
    }
    if (!('lastHarvest' in vaultConfig)) {
      return null;
    }
    let lh = 0;
    if (isString(vaultConfig.lastHarvest)) {
      lh = parseInt(vaultConfig.lastHarvest);
    } else {
      lh = vaultConfig.lastHarvest;
    }
    if (lh === 0) {
      return null;
    }

    return new Date(lh * 1000);
  }

  public async getFees(): Promise<ApyFeeData> {
    if (featureFlag_simulateBeefyApiError('fees')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get<ApyFeeData>('/fees', {
      params: { _: this.getCacheBuster('long') },
    });
    return res.data;
  }

  public async getChartData(
    stat: string,
    name: string,
    period: string,
    from: number,
    to: number,
    limit: number
  ) {
    const res = await this.data.get<BeefyChartDataResponse>(`/${stat}`, {
      params: { name, period, from, to, limit },
    });
    return res.data;
  }

  public async getTreasury(): Promise<TreasuryConfig> {
    if (featureFlag_simulateBeefyApiError('treasury')) {
      throw new Error('Simulated beefy api error');
    }

    const res = await this.api.get<TreasuryConfig>('/treasury', {
      params: { _: this.getCacheBuster('long') },
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
