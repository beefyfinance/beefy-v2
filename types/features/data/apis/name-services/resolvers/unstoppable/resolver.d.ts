import type { ChainId } from '../../../../entities/chain';
import { type Address } from 'viem';
/**
 * Lookup the (first) address for a domain name
 */
export declare function domainToAddress(domain: string, chainId: ChainId): Promise<Address | undefined>;
/**
 * Lookup the (first) domain name for an address
 */
export declare function addressToDomain(address: Address, chainId: ChainId): Promise<string | undefined>;
