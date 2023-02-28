import { config } from '../../src/config/config';
import { ChainEntity } from '../../src/features/data/entities/chain';

export type AppChainId = keyof typeof config;
export const chainsByAppId: Record<AppChainId, ChainEntity> = Object.entries(config).reduce(
  (acc, [chainId, chainConfig]) => {
    acc[chainId] = {
      ...chainConfig,
      id: chainId,
      networkChainId: chainConfig.chainId,
    };
    return acc;
  },
  {}
);
