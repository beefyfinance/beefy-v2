import { isAddress } from 'viem';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const EEEE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const NATIVE_ADDRESS_ALTERNATIVES = [ZERO_ADDRESS, EEEE_ADDRESS.toLowerCase()];

export function isNativeAlternativeAddress(address: string) {
  return NATIVE_ADDRESS_ALTERNATIVES.includes(address.toLowerCase());
}

export function isValidAddress(address: string) {
  return address.startsWith('0x') && address.length === 42 && isAddress(address, { strict: false });
}

export function isMaybeDomain(domain: string): boolean {
  if (domain.length < 3) {
    return false;
  }

  const lastDot = domain.lastIndexOf('.');
  if (lastDot === -1) {
    return false;
  }

  const tldLength = domain.length - lastDot - 1;
  // .x and .unstoppable
  if (tldLength < 1 || tldLength > 11) {
    return false;
  }

  return true;
}
