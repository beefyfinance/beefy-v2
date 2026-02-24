import { getJson } from '../../../../helpers/http/http.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type { MessageListResponse } from './cctp-api-types.ts';

const API_URL = import.meta.env.VITE_CCTP_URL || 'https://cctp-relay.beefy.com';

const VERSION = 'v1';

export class CCTPApi {
  public api: string;
  public version: string;

  constructor() {
    this.api = API_URL;
    this.version = VERSION;
  }

  public async getTxStatusByTxHash(
    srcChainId: ChainEntity['networkChainId'],
    txHash: string
  ): Promise<MessageListResponse> {
    return await getJson<MessageListResponse>({
      url: `${this.api}/${this.version}/messages/by-tx/${srcChainId}/${txHash}`,
    });
  }
}
