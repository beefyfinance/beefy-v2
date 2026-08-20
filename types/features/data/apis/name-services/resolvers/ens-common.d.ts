import { type Address } from 'viem';
import type { ChainId } from '../../../entities/chain';
import type { ResolverMethods } from '../types';
type ChainParams = {
    registryAddress: Address;
    /** ENSIP-19 */
    reverseDomain?: string;
};
type MakeEnsResolverParams<TChain extends ChainId> = Record<TChain, ChainParams>;
export declare function makeEnsResolver<TChain extends ChainId>(_chains: MakeEnsResolverParams<TChain>): ResolverMethods;
export {};
