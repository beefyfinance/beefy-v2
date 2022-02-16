import axios, { AxiosInstance } from 'axios';
import BigNumber from 'bignumber.js';
import { isString } from 'lodash';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';
import { mapValuesDeep } from '../utils/array-utils';

export interface ApyGovVault {
  vaultApr: number;
}
export interface ApyMaxiVault {
  totalApy: number;
}
export interface ApyStandard {
  beefyPerformanceFee: number;
  vaultApr: number;
  compoundingsPerYear: number;
  vaultApy: number;
  tradingApr?: number;
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
export interface BeefyAPIBreakdownResponse {
  [vaultId: VaultEntity['id']]: ApyData;
}

export interface BeefyAPIHistoricalAPYResponse {
  // those are of type string but they represent numbers
  // also for some reason there is 7 items on each array
  [vaultId: VaultEntity['id']]: string[];
}

export interface BeefyAPIBuybackResponse {
  // those are of type string but they represent numbers
  [chainId: ChainEntity['id']]: { buybackTokenAmount: BigNumber; buybackUsdAmount: BigNumber };
}

// note that there is more infos but we don't need it
export type BeefyAPIVaultsResponse = {
  id: string;
  lastHarvest?: number | string;
}[];

export class BeefyAPI {
  public api: AxiosInstance;
  public data: AxiosInstance;

  constructor() {
    // this could be mocked by passing mock axios to the constructor
    this.api = axios.create({
      baseURL: 'https://api.beefy.finance',
      timeout: 30 * 1000,
    });
    this.data = axios.create({
      baseURL: 'https://data.beefy.finance',
      timeout: 30 * 1000,
    });
  }

  // here we can nicely type the responses
  public async getPrices(): Promise<BeefyAPITokenPricesResponse> {
    const res = await this.api.get('/prices', { params: { _: this.getCacheBuster('hour') } });
    return res.data;
  }

  // i'm not 100% certain about the return type
  // are those token ids ?
  public async getLPs(): Promise<BeefyAPITokenPricesResponse> {
    const res = await this.api.get('/lps', { params: { _: this.getCacheBuster('hour') } });
    return res.data;
  }

  public async getBreakdown(): Promise<BeefyAPIBreakdownResponse> {
    const res = await this.api.get('/apy/breakdown', {
      params: { _: this.getCacheBuster('day') },
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

  public async getHistoricalAPY(): Promise<BeefyAPIHistoricalAPYResponse> {
    const res = await this.data.get('/bulk', { params: { _: this.getCacheBuster() } });
    return res.data;
  }

  public async getBuyBack(): Promise<BeefyAPIBuybackResponse> {
    type ResponseType = {
      data: {
        [chainId: ChainEntity['id']]: {
          buybackTokenAmount: string;
          buybackUsdAmount: string;
        };
      };
    };
    const strRes = await this.api.get<ResponseType>('/bifibuyback', {
      params: { _: this.getCacheBuster('hour') },
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
      params: { _: this.getCacheBuster('hour') },
    });

    // const vault = data.filter(vault => vault.id.includes(vaultId));
    const vaultConfig = res.data.find(vault => {
      return vault.id === vaultId;
    });

    if (!vaultConfig) {
      throw new Error('Could not find vault last harvest');
    }
    if (!('lastHarvest' in vaultConfig)) {
      return null;
    }
    let lh = 0;
    if (isString(vaultConfig.lastHarvest)) {
      lh = parseInt(vaultConfig.lastHarvest);
    }
    if (lh === 0) {
      return null;
    }

    return new Date(lh * 1000);
  }

  // maybe have a local cache instead of this cache busting
  // have to check if this returns browser cache before doing so
  protected getCacheBuster(mode: 'hour' | 'day' = 'day'): number {
    if (mode === 'hour') {
      return Math.trunc(Date.now() / (1000 * 60));
    } else {
      const cache = new Date();
      cache.setMinutes(0, 0, 0);
      return cache.getTime();
    }
  }
}
