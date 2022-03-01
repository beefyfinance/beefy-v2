import axios, { AxiosInstance } from 'axios';

export class LaCucinaApi {
  public api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: 'https://partners.lacucina.io/v2/public',
      timeout: 30 * 1000,
    });
  }
  public async getLaCucinaInfo(ovenId: string): Promise<any> {
    const response = await this.api.get(`/oven/details/${ovenId}`);
    return response.data;
  }
}

const laCucinaApi = new LaCucinaApi();

export function getLaCucinaApi(): LaCucinaApi {
  return laCucinaApi;
}
