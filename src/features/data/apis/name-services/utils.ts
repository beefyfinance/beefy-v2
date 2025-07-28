import { uniq } from 'lodash-es';
import { type Address, getAddress, type Hash, isAddress, numberToHex } from 'viem';
import { namehash, normalize } from 'viem/ens';
import { ZERO_ADDRESS } from '../../../../helpers/addresses.ts';
import type { ChainId } from '../../entities/chain.ts';

export function hashDomain(domain: string): Hash {
  return namehash(domain);
}

export function normalizeDomain(domain: string): string {
  return normalize(domain);
}

export function normalizeAndHashDomain(domain: string): Hash {
  return hashDomain(normalizeDomain(domain));
}

export function normalizeAddress(address: unknown): Address | undefined {
  if (typeof address === 'string' && address.length === 42 && address !== ZERO_ADDRESS) {
    if (isAddress(address, { strict: false })) {
      return getAddress(address);
    }
  }

  return undefined;
}

export function getAllChainsFromTldToChain(tldToChain: Record<string, ChainId[]>): ChainId[] {
  return uniq(Object.values(tldToChain).flat());
}

/**
 * ENSIP-11: EVM compatible Chain Address Resolution
 * @see https://docs.ens.domains/ensip/11/
 **/
export function chainIdToCoinType(chainId: number): number {
  return (0x80000000 | chainId) >>> 0;
}

/**
 * ENSIP-19: Multichain Primary Names
 * @see https://docs.ens.domains/ensip/19/
 */
export function coinTypeToReverseDomain(coinType: number): string {
  switch (coinType) {
    case 60:
      return 'addr.reverse';
    case 0x8000_0000:
      return 'default.reverse';
    default: {
      if (coinType < 0 || coinType > 0xffff_ffff) {
        throw new Error(`Invalid coin type: ${coinType}`);
      }
      return `${numberToHex(coinType, { size: 4 }).slice(2)}.reverse`;
    }
  }
}

/**
 * ENSIP-19: Multichain Primary Names
 * @see https://docs.ens.domains/ensip/19/
 */
export function chainIdToReverseDomain(chainId: number): string {
  return coinTypeToReverseDomain(chainIdToCoinType(chainId));
}
