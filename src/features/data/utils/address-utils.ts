import type { Address } from 'viem';

/** Lowercase rather than checksum: we use more addresses than viem's checksum cache holds. */
export function toCallAddress(address: string): Address {
  return address.toLowerCase() as Address;
}
