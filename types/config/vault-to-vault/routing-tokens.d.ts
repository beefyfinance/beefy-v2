import type { Address } from 'viem';
import type { ChainEntity } from '../../features/data/entities/chain';
import type { TokenEntity } from '../../features/data/entities/token';
import type { BeefyState } from '../../features/data/store/types';
/**
 * Per-chain list of tokens that can serve as the routing handoff in a same-chain
 * vault-to-vault zap (`VaultToVaultSingleTokenStrategy`).
 */
export type V2VRoutingTokenConfig = Partial<Record<ChainEntity['id'], readonly Address[]>>;
export declare const V2V_ROUTING_TOKENS: V2VRoutingTokenConfig;
export declare function hasRoutingTokensForChain(chainId: ChainEntity['id']): boolean;
export declare function getRoutingTokensForChain(chainId: ChainEntity['id'], state: BeefyState): TokenEntity[];
