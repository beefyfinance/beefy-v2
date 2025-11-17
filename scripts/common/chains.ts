import type { config } from '../../src/config/config.ts';
import type { ChainEntity } from '../../src/features/data/apis/chains/entity-types.ts';
import { entities } from '../../src/features/data/apis/chains/entities.ts';

export type AppChainId = (typeof config)[number]['id'];

export const chainsByAppId: Record<AppChainId, ChainEntity> = entities.reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<AppChainId, ChainEntity>
);

export const allChainIds: AppChainId[] = Object.keys(chainsByAppId) as AppChainId[];
