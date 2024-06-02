import { config } from '../../src/config/config';
import { ChainEntity } from '../../src/features/data/entities/chain';

export type AppChainId = ChainEntity['id'];

export const chainsByAppId: Record<AppChainId, ChainEntity> = Object.entries(config).reduce(
  (acc, [chainId, chainConfig]) => {
    acc[chainId] = {
      ...chainConfig,
      id: chainId,
      networkChainId: chainConfig.chainId,
    };
    return acc;
  },
  {} as Record<AppChainId, ChainEntity>
);

export const allChainIds: AppChainId[] = Object.keys(chainsByAppId) as AppChainId[];
