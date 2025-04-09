import { createPublicClient, type PublicClient, type Client, type BlockTag } from 'viem';
import type { ChainEntity, ChainId } from '../../entities/chain.ts';
import { makeCustomFallbackTransport } from '../viem/transports/transports.ts';
import { buildViemChain } from '../viem/chains.ts';
import { getGasPrice, getFeeHistory } from 'viem/actions';
import BigNumber from 'bignumber.js';
import type { ChainConfig } from '../config-types.ts';

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

export const getBeefyGasPrice = async (client: Client) => {
  const gasPrice = await getGasPrice(client);
  return new BigNumber(gasPrice.toString(10));
};

export const getBeefyFeeHistory = async (
  client: Client,
  blockCount: number,
  newestBlock: BlockTag | number,
  rewardPercentiles: number[]
): Promise<BeefyFeeHistory> => {
  const blockNumberParam =
    typeof newestBlock === 'number' ?
      { blockNumber: BigInt(newestBlock) }
    : { blockTag: newestBlock };
  const feeHistory = await getFeeHistory(client, {
    blockCount: blockCount,
    ...blockNumberParam,
    rewardPercentiles: rewardPercentiles,
  });

  return {
    baseFeePerGas: feeHistory.baseFeePerGas.map(baseFee => new BigNumber(baseFee.toString(10))),
    gasUsedRatio: feeHistory.gasUsedRatio,
    oldestBlock: new BigNumber(feeHistory.oldestBlock.toString(10)),
    reward:
      feeHistory.reward?.map(rewards =>
        rewards.map(reward => new BigNumber(reward.toString(10)))
      ) || [],
  };
};

class RpcClientManager {
  private clients: Map<ChainId, RpcClients> = new Map();

  // Create new viem clients using the provided chain config and RPC URLs.
  private createClients(chain: ChainEntity | ChainConfig, rpcUrls: string[]): RpcClients {
    const retries = chain.eol ? 1 : 3;
    // Create a viem client with a fallback transport for single calls.
    const singleCallClient = createPublicClient({
      chain: buildViemChain(chain),
      transport: makeCustomFallbackTransport(rpcUrls, retries),
    });

    // Create a viem client with batching enabled. (Assumes multicall support)
    const batchCallClient = createPublicClient({
      chain: buildViemChain(chain),
      transport: makeCustomFallbackTransport(rpcUrls, retries),
      batch: {
        multicall: {
          batchSize: 1024,
          wait: 250,
        },
      },
    });

    return { singleCallClient, batchCallClient };
  }

  /**
   * Initialize or update clients for a chainId.
   */
  public setClients(chain: ChainEntity | ChainConfig, rpcUrls: string[]): void {
    const clients = this.createClients(chain, rpcUrls);
    this.clients.set(chain.id, clients);
  }

  /**
   * Retrieve the clients for a given chainId.
   */
  public getClients(chainId: ChainId): RpcClients {
    const clients = this.clients.get(chainId);
    if (!clients) {
      throw new Error(`No clients found for chainId: ${chainId}`);
    }
    return clients;
  }

  public getSingleClient(chainId: ChainId): PublicClient {
    return this.getClients(chainId).singleCallClient;
  }

  public getBatchClient(chainId: ChainId): PublicClient {
    return this.getClients(chainId).batchCallClient;
  }
}

// Singleton instance
export const rpcClientManager = new RpcClientManager();
