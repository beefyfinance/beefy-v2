import axios, { AxiosInstance } from 'axios';

const { REACT_APP_LACUCINA_APIKEY } = process.env;

export class LaCucinaApi {
  public api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: 'https://partners.lacucina.io/v2/public',
      timeout: 30 * 1000,
      headers: { 'x-api-key': REACT_APP_LACUCINA_APIKEY },
    });
  }
  public async getLaCucinaInfo(ovenId: string): Promise<LaCucinaResponse> {
    const response = await this.api.get(`/oven/details/${ovenId}`);
    return response.data;
  }
}

const laCucinaApi = new LaCucinaApi();

export function getLaCucinaApi(): LaCucinaApi {
  return laCucinaApi;
}

export interface LaCucinaResponse {
  success: string;
  status: number;
  message: string;
  data: {
    aprValue: string;
    totalLacEarned: string;
    rewardTokenAddress: string;
    rewardTokenSymbol: string;
    effectiveDate: string;
    claimExpiryDate: number;
    expiryDate: string;
    isRetroactive: boolean;
    status: string;
    swapProtocol: string;
    network: string;
    contractAddress: string;
  };
}
