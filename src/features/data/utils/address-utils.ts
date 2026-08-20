import type { Address } from 'viem';

/**
 * Lowercase an address for use as a contract-call argument.
 *
 * viem's ABI encoder lowercases the address anyway; the only thing a mixed-case (checksummed)
 * address buys at encode time is `isAddress`'s strict checksum verification, which runs keccak256.
 * That check is memoized behind an 8192-entry LRU, and we encode ~9.6k distinct addresses per
 * poll cycle, so the cache thrashes and the hash is recomputed every cycle.
 *
 * Measured over the repo's own vault configs (9,648 addresses, 49 batches): 96ms checksummed vs
 * 25ms lowercased, repeatable on every pass.
 *
 * Addresses reaching these call sites come from validated config and on-chain reads, not user
 * input, so the checksum verification is not load-bearing here.
 */
export function toCallAddress(address: string): Address {
  return address.toLowerCase() as Address;
}

export function toCallAddresses(addresses: string[]): Address[] {
  return addresses.map(toCallAddress);
}
