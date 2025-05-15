import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { AmmEntity, SwapAggregatorEntity, ZapEntity } from '../entities/zap.ts';

export type ZapsState = {
  /**
   * Beefy zap contract config for each chain
   */
  zaps: {
    byChainId: {
      [chainId in ChainEntity['id']]?: ZapEntity;
    };
  };
  /**
   * Swap aggregator configs for each chain
   */
  aggregators: {
    allIds: SwapAggregatorEntity['id'][];
    byId: {
      [aggregatorId: string]: SwapAggregatorEntity;
    };
    byChainId: {
      [chainId in ChainEntity['id']]?: {
        allIds: SwapAggregatorEntity['id'][];
        byType: {
          [aggregatorType in SwapAggregatorEntity['type']]?: SwapAggregatorEntity['id'];
        };
      };
    };
  };
  /**
   * AMM configs for each chain
   */
  amms: {
    byId: {
      [ammId: AmmEntity['id']]: AmmEntity;
    };
    byChainId: {
      [chainId in ChainEntity['id']]?: AmmEntity[];
    };
  };
  /**
   * Token support for each swap aggregator
   */
  swaps: {
    byChainId: {
      [chainId in ChainEntity['id']]?: {
        byProvider: {
          [providerId: string]: TokenEntity['address'][];
        };
        byAddress: {
          [address: string]: string[];
        };
      };
    };
  };
  /**
   * Vault zap support
   */
  vaults: {
    byId: {
      [vaultId: VaultEntity['id']]: boolean;
    };
  };
  /**
   * Token scores for UI sorting
   */
  tokens: {
    byChainId: {
      [chainId in ChainEntity['id']]?: {
        scoreById: Record<string, number>;
      };
    };
  };
};
