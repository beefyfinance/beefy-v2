import { type PublicClient, type Client, type BlockTag } from 'viem';
import type { ChainEntity, ChainId } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import type { ChainConfig } from '../config-types';
type RpcClients = {
    singleCallClient: PublicClient;
    batchCallClient: PublicClient;
};
type BeefyFeeHistory = {
    baseFeePerGas: BigNumber[];
    gasUsedRatio: number[];
    oldestBlock: BigNumber;
    reward: BigNumber[][];
};
export declare const getBeefyGasPrice: (client: Client) => Promise<BigNumber>;
export declare const getBeefyFeeHistory: (client: Client, blockCount: number, newestBlock: BlockTag | number, rewardPercentiles: number[]) => Promise<BeefyFeeHistory>;
declare class RpcClientManager {
    private clients;
    private createClients;
    /**
     * Initialize or update clients for a chainId.
     */
    setClients(chain: ChainEntity | ChainConfig, rpcUrls: string[]): void;
    /**
     * Retrieve the clients for a given chainId.
     */
    getClients(chainId: ChainId): RpcClients;
    getSingleClient(chainId: ChainId): PublicClient;
    getBatchClient(chainId: ChainId): PublicClient;
}
export declare const rpcClientManager: RpcClientManager;
export {};
