import { type Duration } from 'date-fns';
import type { DurationSingle } from './date-types';
export declare function datesAreEqual(a: Date | undefined, b: Date | undefined): boolean;
export type FormatTimeLabels = {
    [K in keyof Duration]?: string | ((count: number) => string);
};
export type FormatTimeUntilOptions = {
    maxParts?: number;
    minParts?: number;
    padLength?: number;
    from?: Date;
    labels?: FormatTimeLabels;
    separator?: string;
};
export declare function formatTimeUntil(when: Date, { maxParts, minParts, padLength, from, labels, separator, }: FormatTimeUntilOptions): string;
export declare function roundDownMinutes(date: Date): Date;
export declare function formatMinutesDuration(minutes: number): string;
export declare function isDurationEqual(base: Duration, compareTo: Duration): boolean;
export declare function convertDurationField(value: number, from: keyof Duration, to: keyof Duration): number;
export declare function convertDurationSingle(duration: DurationSingle, to: keyof Duration): DurationSingle;
export declare function isLonger(base: Duration, compareTo: Duration): boolean;
/** whether it has been at least `duration` since `date` */
export declare function isMoreThanDurationAgo(date: Date, duration: Duration): boolean;
export declare function isMoreThanDurationAgoUnix(unixDate: number, duration: Duration): boolean;
export declare function isLessThanDurationAgo(date: Date, duration: Duration): boolean;
export declare function isLessThanDurationAgoUnix(unixDate: number, duration: Duration): boolean;
export declare function getUnixNow(): number;
export declare function formatDateTime(date: Date | number): string;
export declare function formatDateTimeWithSeconds(date: Date | number): string;
export declare function formatDate(date: Date | number): string;
export declare function formatTime(date: Date | number): string;
export declare function formatTimeWithSeconds(date: Date | number): string;
export declare function formatChartDate(date: Date | number): string;
