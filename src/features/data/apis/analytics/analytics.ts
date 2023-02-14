import axios, { AxiosInstance } from 'axios';
import { AnalyticsUserTimelineResponse } from './analytics-types';

export class AnalyticsApi {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://datamart.beefy.com/api',
    });
  }

  public async getUserVaults(address: string): Promise<AnalyticsUserTimelineResponse> {
    const res = await this.api.get('/v0/beefy/timeline', { params: { address } });
    return res.data;
  }
}
