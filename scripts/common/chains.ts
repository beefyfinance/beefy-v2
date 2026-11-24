import { config, enabledChainIds, type EnabledChainId } from '../../src/config/config.ts';
import type { ChainEntity } from '../../src/features/data/entities/chain.ts';

export type AppChainId = EnabledChainId;

export const chainsByAppId: Record<AppChainId, ChainEntity> = enabledChainIds.reduce(
  (acc, chainId) => {
    const chainConfig = config[chainId];
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
