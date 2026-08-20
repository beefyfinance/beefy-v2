import type { ChainEntity } from '../../entities/chain';
import type { MessageListResponse } from './cctp-api-types';
export declare class CCTPApi {
    api: string;
    version: string;
    constructor();
    getTxStatusByTxHash(srcNetworkId: ChainEntity['networkChainId'], txHash: string): Promise<MessageListResponse>;
}
