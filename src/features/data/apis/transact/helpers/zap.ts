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
