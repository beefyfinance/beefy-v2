import { config } from '../../src/config/config.ts';
import type { ChainConfig } from '../../src/features/data/apis/config-types.ts';
import type { ChainEntity } from '../../src/features/data/entities/chain.ts';
import { entries } from '../../src/helpers/object.js';

export type AppChainId = keyof typeof config;

export const chainsByAppId: Record<AppChainId, ChainEntity> = entries(config).reduce(
  (acc, [chainId, chainConfig]: [AppChainId, Omit<ChainConfig, 'id'>]) => {
    acc[chainId] = {
      ...chainConfig,
      id: chainId,
      networkChainId: chainConfig.chainId,
      explorerTokenUrlTemplate:
        chainConfig.explorerTokenUrlTemplate || `${chainConfig.explorerUrl}/token/{address}`,
      explorerAddressUrlTemplate:
        chainConfig.explorerAddressUrlTemplate || `${chainConfig.explorerUrl}/address/{address}`,
      explorerTxUrlTemplate:
        chainConfig.explorerTxUrlTemplate || `${chainConfig.explorerUrl}/tx/{hash}`,
    };
    return acc;
  },
  {} as Record<AppChainId, ChainEntity>
);

export const allChainIds: AppChainId[] = Object.keys(chainsByAppId) as AppChainId[];
