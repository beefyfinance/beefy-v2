import type { ChainEntity } from '../entities/chain';
import type { NormalizedEntity } from '../utils/normalized-entity';
type ActiveRpcConfig = {
    rpcs: string[];
};
/**
 * State containing Vault infos
 */
export type ChainsState = NormalizedEntity<ChainEntity> & {
    activeIds: ChainEntity['id'][];
    eolIds: ChainEntity['id'][];
    chainIdByNetworkChainId: Record<ChainEntity['networkChainId'], ChainEntity['id']>;
    activeRpcsByChainId: {
        -readonly [id in ChainEntity['id']]?: ActiveRpcConfig;
    };
};
export {};
