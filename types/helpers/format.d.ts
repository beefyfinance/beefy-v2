import BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import type { AvgApy, AvgApyPeriod, TotalApy } from '../features/data/reducers/apy-types';
import { type BigNumberish } from './big-number';
export declare enum Scale {
    None = 0,
    Thousand = 3,
    Million = 6,
    Billion = 9,
    Trillion = 12,
    Quadrillion = 15,
    Quintillion = 18,
    Sextillion = 21,
    Septillion = 24,
    Octillion = 27,
    Nonillion = 30
}
/**
 * Format a (BigNumber|number) to a string of {decimals} decimal places
 * Example use: input fields
 * @param value number or BigNumber
 * @param decimals how many decimal places to output (how many decimals the token has)
 */
export declare function formatTokenInput(value: BigNumberish, decimals: number): string;
/**
 * Format a (BigNumber|number) to a string for display
 * Strips trailing decimal 0s
 * @param input number or BigNumber
 * @param decimals
 */
export declare function formatTokenDisplay(input: BigNumberish, decimals: number): string;
/**
 * Format a (BigNumber|number) to a shortened string for display
 * Attempts to only show {digits} overall digits (will show more if whole part is longer)
 * Condenses leading decimal zeros to subscript notation
 * @param input number or BigNumber
 * @param decimals how many decimals the token has
 * @param digits how many overall digits to display (default: 8)
 */
export declare function formatTokenDisplayCondensed(input: BigNumberish, decimals: number, digits?: number): string;
/**
 * Formats a number to output as a percent% string
 * @param input as decimal e.g. 0.01 to represent 1%
 * @param decimals decimal places
 * @param missingPlaceholder to show if percent is null or undefined
 * @param veryLargePlaceholder to show if percent is very large
 */
export declare function formatLargePercent<T = string>(input: BigNumberish | null | undefined, decimals?: number, missingPlaceholder?: T | string, veryLargePlaceholder?: T | string): T | string;
/**
 * @param input as decimal e.g. 0.01 to represent 1%
 * @param decimals decimal places
 * @param roundMode
 */
export declare function formatPercent(input: BigNumberish, decimals?: number, roundMode?: BigNumber.RoundingMode): string;
export declare function formatPercentTrim(input: Parameters<typeof formatPercent>[0], decimals?: number): string;
interface FormatLargeNumberOptions {
    /** from what order of magnitude should we start formatting to scale */
    minScale: Scale;
    /** under what value should decimals be output */
    decimalsUnder: BigNumberish;
    /** maximum decimal places to output */
    decimals: number;
    /** minimum decimal places to output */
    decimalsMin: number;
    /** add minimum decimals even when value is 0 */
    decimalsMinAppliesToZero: boolean;
    /** show if number is so large we run out of scales */
    veryLargePlaceholder?: string;
}
export declare function formatUsd(input: BigNumberish, decimals?: number): string;
/** @see defaultFormatLargeUsdOptions */
export type FormatLargeUsdOptions = FormatLargeNumberOptions & {
    zeroPrefix: string;
    negativePrefix: string;
    positivePrefix: string;
};
/**
 * Formats: 123 -> $123, 1234 -> $1234, 1234567 -> $1.23M etc
 * @param input
 * @param options
 */
export declare function formatLargeUsd(input: BigNumberish, options?: Partial<FormatLargeUsdOptions>): string;
export type FormattedTotalApy<T = string> = {
    [K in keyof TotalApy]: TotalApy[K] extends T ? TotalApy[K] : T;
};
export declare function formatTotalApy(totalApy: TotalApy, placeholder?: string): FormattedTotalApy;
export declare function formatTotalApy(totalApy: TotalApy, placeholder?: ReactNode): FormattedTotalApy<ReactNode>;
export type FormattedAvgApy = AvgApy & {
    periods: Record<number, AvgApyPeriod & {
        formatted?: string;
    }>;
};
export declare function formatAvgApy(avgApy: AvgApy): FormattedAvgApy;
export declare function convertAmountToRawNumber(value: BigNumber.Value, decimals?: number): string;
export declare function maybeHexToNumber(input: unknown): number;
export declare function formatAddressShort(addr: string, prefixLen?: number, postfixLen?: number): string;
export declare function formatDomain(domain: string, length?: number): string;
export declare function errorToString(error: unknown, fallbackMessage?: string): string;
export declare function zeroPad(value: number | undefined, length: number): string;
export declare function formatPositiveOrNegative(number: BigNumber, value: string, symbol?: string): string;
export declare function formatNumber(value: number, maxDecimals: number): string;
export {};
