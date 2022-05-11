import axios, { AxiosInstance } from 'axios';

export class BridgeApi {
  public api: AxiosInstance;

  constructions() {
    this.api = axios.create({
      baseURL: 'https://bridgeapi.anyswap.exchange/v3',
      timeout: 30 * 1000,
    });
  }

  async getTokens(): Promise<unknown> {
    const res = await this.api.get('/serverinfoV3?chainId=all&version=all');
    console.log(res.data);
    return res.data;
  }
}
