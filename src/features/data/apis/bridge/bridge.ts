import axios, { AxiosInstance } from 'axios';
import { ChainEntity } from '../../entities/chain';

export class BridgeApi {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://bridgeapi.anyswap.exchange',
    });
  }

  public async getBridgeChainData(networkChainId: ChainEntity['networkChainId']): Promise<unknown> {
    const res = await this.api.get(`/merge/tokenlist/${networkChainId}`);
    const data = Object.values(res.data).filter((token: any) => token.symbol === 'BIFI');
    return data[0];
  }

  public async getTxStatus(txHash: string): Promise<unknown> {
    const res = await this.api.get(`/v2/history/details?params=${txHash}`);
    return res;
  }
}
