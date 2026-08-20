import type { TokenEntity } from '../../../entities/token';
import type { OrderRelay } from '../zap/types';
export declare const NO_RELAY: OrderRelay;
/**
 * Returns the address of the token, or the zero address if it's native.
 */
export declare function getTokenAddress(token: TokenEntity): string;
/**
 * Returns the byte offset for the nth parameter in calldata.
 * (Calldata is 4 bytes for the function selector, then 32 bytes per parameter.)
 */
export declare function getInsertIndex(position: number): number;
