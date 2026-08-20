import BigNumber from 'bignumber.js';
import type { TokenAmount } from '../features/data/apis/transact/transact-types';
import type { TokenEntity } from '../features/data/entities/token';
export type BigNumberish = BigNumber.Value;
export declare const BIG_ZERO: BigNumber;
export declare const BIG_ONE: BigNumber;
export declare const BIG_MAX_UINT256: BigNumber;
export declare const BIG_MAX_INT256: BigNumber;
export declare const BIG_MIN_INT256: BigNumber;
export declare const Q192: BigNumber;
export declare function compound(rate: BigNumberish, principal?: BigNumberish, periods?: number, times?: number): BigNumber;
export declare function toBigNumber(input: BigNumberish): BigNumber;
export declare function isBigNumber(value: unknown): value is BigNumber;
export declare function bigNumberToUint256String(value: BigNumber): string;
export declare function bigNumberToInt256String(value: BigNumber): string;
export declare function bigNumberToBigInt(value: BigNumber): bigint;
export declare function truncateBigNumber(value: BigNumber, places: number): BigNumber;
export declare function averageBigNumbers(values: BigNumber[]): BigNumber;
export declare function toWei(value: BigNumber, decimals: number): BigNumber;
export declare function toWeiBigInt(value: BigNumber, decimals: number): bigint;
export declare function toWeiFromString(value: string, decimals: number): BigNumber;
export declare function toWeiFromTokenAmount(tokenAmount: TokenAmount): BigNumber;
export declare function toWeiString(value: BigNumber, decimals: number): string;
export declare function fromWei(value: BigNumber.Value, decimals: number): BigNumber;
export declare function fromWeiToTokenAmount(value: BigNumber.Value, token: TokenEntity): TokenAmount;
/**
 * Recursively maps over an object and replaces any BigNumber object with string value
 * e.g. "BN(123.567)"
 * Use only for debugging
 */
export declare function bigNumberToStringDeep(input: unknown): unknown;
export declare function isFiniteBigNumber(value: unknown): value is BigNumber;
export declare function compareBigNumber(a: BigNumber, b: BigNumber): number;
export declare function orderByBigNumber<T>(items: T[], extractor: (item: T) => BigNumber, direction?: 'asc' | 'desc'): T[];
/** 0.1 = 10% */
export declare function percentDifference(a: BigNumber, b: BigNumber): BigNumber;
/** 0.1 = 10% */
export declare function isEqualWithinPercent(a: BigNumber, b: BigNumber, percent: BigNumber.Value): boolean;
