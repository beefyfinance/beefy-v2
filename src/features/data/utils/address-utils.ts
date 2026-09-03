import type { Address } from 'viem';

/**
 * Lowercase an address for use as a contract-call argument.
 *
 * We use more addresses than viem's checksumAddress LRU cache size,
 * lowercasing skips checksumming.
 */
export function toCallAddress(address: string): Address {
  return address.toLowerCase() as Address;
}
