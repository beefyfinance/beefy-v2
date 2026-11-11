import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import type { OrderRelay } from '../zap/types.ts';

export const NO_RELAY: OrderRelay = { target: ZERO_ADDRESS, value: '0', data: '0x' };

/**
 * Returns the address of the token, or the zero address if it's native.
 */
export function getTokenAddress(token: TokenEntity): string {
  if (token.address === 'native') {
    return ZERO_ADDRESS;
  }

  return token.address;
}

/**
 * Returns the byte offset for the nth parameter in calldata.
 * (Calldata is 4 bytes for the function selector, then 32 bytes per parameter.)
 */
export function getInsertIndex(position: number): number {
  return 4 + position * 32;
}

/**
 * Returns the byte offset of the single 32-byte calldata word equal to `value`.
 * For amounts nested inside dynamic params where the position is not a plain parameter index.
 */
export function findInsertIndex(data: string, value: bigint): number {
  const hex = data.startsWith('0x') ? data.slice(2) : data;
  const target = value.toString(16).padStart(64, '0');
  const matches: number[] = [];
  for (let offset = 8; offset + 64 <= hex.length; offset += 64) {
    if (hex.slice(offset, offset + 64) === target) {
      matches.push(offset / 2);
    }
  }
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one calldata word equal to ${value}, found ${matches.length}`
    );
  }
  return matches[0];
}
