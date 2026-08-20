import { type Address, type Hash } from 'viem';
import type { ChainId } from '../../entities/chain';
export declare function hashDomain(domain: string): Hash;
export declare function normalizeDomain(domain: string): string;
export declare function normalizeAndHashDomain(domain: string): Hash;
export declare function normalizeAddress(address: unknown): Address | undefined;
export declare function getAllChainsFromTldToChain(tldToChain: Record<string, ChainId[]>): ChainId[];
/**
 * ENSIP-11: EVM compatible Chain Address Resolution
 * @see https://docs.ens.domains/ensip/11/
 **/
export declare function chainIdToCoinType(chainId: number): number;
/**
 * ENSIP-19: Multichain Primary Names
 * @see https://docs.ens.domains/ensip/19/
 */
export declare function coinTypeToReverseDomain(coinType: number): string;
/**
 * ENSIP-19: Multichain Primary Names
 * @see https://docs.ens.domains/ensip/19/
 */
export declare function chainIdToReverseDomain(chainId: number): string;
