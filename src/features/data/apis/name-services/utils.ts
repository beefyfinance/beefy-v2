import { namehash, normalize } from 'viem/ens';
import { type Address, getAddress, type Hash, isAddress } from 'viem';
import { ZERO_ADDRESS } from '../../../../helpers/addresses.ts';
import type { ChainId } from '../../entities/chain.ts';
import { uniq } from 'lodash-es';

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
