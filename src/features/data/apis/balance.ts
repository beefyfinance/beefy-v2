import { MultiCall } from 'eth-multicall';
import { ChainConfig } from './config';

export class BalanceAPI {
  constructor(protected walletAddress: string, protected rpcEndpoint: string) {}

  // here we can nicely type the responses
  public async fetchTokensBalance(chainConfig: ChainConfig): Promise<> {
    const mc = new MultiCall(this.rpcEndpoint, chainConfig.multicallAddress);
  }
}
