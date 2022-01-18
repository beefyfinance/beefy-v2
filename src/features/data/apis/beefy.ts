import axios, { AxiosInstance } from 'axios';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';

interface ApyGovVault {
  vaultApr: number;
}
interface ApyMaxiVault {
  totalApy: number;
}
interface ApyStandard {
  vaultApr: number;
  compoundingsPerYear: number;
  vaultApy: Number;
  tradingApr?: number;
  totalApy: number;
  // todo: does it make sense to have fees and apy in the same entities?
  lpFee: number;
}
export type ApyData = ApyGovVault | ApyMaxiVault | ApyStandard;

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
      timeout: 1000,
    });
    this.data = axios.create({
      baseURL: 'https://data.beefy.finance',
      timeout: 1000,
    });
  }

  // here we can nicely type the responses
  public async getPrices(): Promise<BeefyAPITokenPricesResponse> {
    return this.api.get('/prices', { params: { _: this.getCacheBuster() } });
  }

  // i'm not 100% certain about the return type
  // are those token ids ?
  public async getLPs(): Promise<BeefyAPITokenPricesResponse> {
    return this.api.get('/lps', { params: { _: this.getCacheBuster() } });
  }

  public async getBreakdown(): Promise<BeefyAPIBreakdownResponse> {
    return this.api.get('/apy/breakdown', { params: { _: this.getCacheBuster() } });
  }

  public async getHistoricalAPY(): Promise<BeefyAPIHistoricalAPYResponse> {
    return this.data.get('/bulk', { params: { _: this.getCacheBuster() } });
  }

  public async getBuyBack(): Promise<BeefyAPIBuybackResponse> {
    return this.api.get('/bifibuyback', { params: { _: this.getCacheBuster('hour') } });
  }

  public async getVaults(): Promise<BeefyAPIVaultsResponse> {
    return this.api.get('/vaults', { params: { _: this.getCacheBuster('hour') } });
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
