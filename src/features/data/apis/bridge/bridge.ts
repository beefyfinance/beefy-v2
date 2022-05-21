import axios, { AxiosInstance } from 'axios';
import { ChainConfig } from '../../apis/config-types';

export class BridgeApi {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://bridgeapi.anyswap.exchange',
    });
  }

  public async getBridgeData(chains: ChainConfig[]): Promise<unknown> {
    const res = await this.api.get('/v3/serverinfoV3?chainId=all&version=UNDERLYINGV2');
    let data = {};
    for (const chain of Object.values(chains)) {
      const token = Object.values(res.data[`${chain.chainId}`]).filter(
        (token: any) => token.underlying?.symbol === 'BIFI' || token.anyToken.symbol === 'BIFI'
      );
      data[chain.id] = token[0];
    }
    return data;
  }

  public async getTxStatus(txHash: string): Promise<unknown> {
    const res = await this.api.get(`/v2/history/details?params=${txHash}`);
    return res;
  }
}
