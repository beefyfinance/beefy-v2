import { ProviderPoolConfig } from './types';
import { parseAbiItem } from 'viem';
import { getRpcClient } from '../../../utils/rpc';

export default {
  strategyTypeId: 'compounds',
  feeTier: async (chainId, address) => {
    const client = getRpcClient(chainId);
    const fee = await client.readContract({
      address,
      abi: [parseAbiItem('function fee() public view returns (uint24)')],
      functionName: 'fee',
    });
    return (fee / 1e6) * 100;
  },
} as const satisfies ProviderPoolConfig;
