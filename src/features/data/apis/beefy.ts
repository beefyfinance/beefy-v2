import axios, { AxiosInstance } from 'axios';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';

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
  [chainId: ChainEntity['id']]: string[];
}

// TODO: is this the same as VaultConfig?
export type BeefyAPIVaultsResponse = any;

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
    const res = await this.api.get('/apy/breakdown', { params: { _: this.getCacheBuster() } });
    return res.data;
  }

  public async getHistoricalAPY(): Promise<BeefyAPIHistoricalAPYResponse> {
    const res = await this.data.get('/bulk', { params: { _: this.getCacheBuster() } });
    return res.data;
  }

  public async getBuyBack(): Promise<BeefyAPIBuybackResponse> {
    const res = await this.api.get('/bifibuyback', { params: { _: this.getCacheBuster('hour') } });
    return res.data;
  }

  public async getVaults(): Promise<BeefyAPIVaultsResponse> {
    const res = await this.api.get('/vaults', { params: { _: this.getCacheBuster('hour') } });
    return res.data;
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
