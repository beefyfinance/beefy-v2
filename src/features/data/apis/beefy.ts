import axios, { AxiosInstance } from 'axios';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';

// maybe "short" and "long" is not the smartest choice of words
interface BeefyAPIBreakdownShort {
  vaultApr: number;
}
interface BeefyAPIBreakdownLong {
  beefyPerformanceFee: number;
  compoundingsPerYear: number;
  lpFee: number;
  totalApy: number;
  tradingApr: number;
  vaultApr: number;
  vaultApy: number;
}

type BeefyAPIBreakdownResponse = {
  [vaultId: VaultEntity['id']]: BeefyAPIBreakdownShort | BeefyAPIBreakdownLong;
};

// I'm not sure what those keys are
type BeefyAPIHistoricalAPYResponse = {
  // those are of type string but they represent numbers
  // also for some reason there is 7 items on each array
  [vaultId: VaultEntity['id']]: string[];
};

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
  public async getPrices(): Promise<{ [tokenId: TokenEntity['id']]: number }> {
    return this.api.get('/prices', { params: { _: this.getCacheBuster() } });
  }

  // i'm not 100% certain about the return type
  // are those token ids ?
  public async getLPs(): Promise<{ [tokenId: TokenEntity['id']]: number }> {
    return this.api.get('/lps', { params: { _: this.getCacheBuster() } });
  }

  public async getBreakdown(): Promise<BeefyAPIBreakdownResponse> {
    return this.api.get('/apy/breakdown', { params: { _: this.getCacheBuster() } });
  }

  public async getHistoricalAPY(): Promise<BeefyAPIHistoricalAPYResponse> {
    return this.data.get('/bulk', { params: { _: this.getCacheBuster() } });
  }

  // maybe have a local cache instead of this cache busting
  // have to check if this returns browser cache before doing so
  protected getCacheBuster(): number {
    return Math.trunc(Date.now() / (1000 * 60));
  }
}
