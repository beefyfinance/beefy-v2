import type { TokenAmount } from '../transact-types';
import { type SerializedError, type SerializedQuoteCowcentratedNoSingleSideError, type SerializedQuoteCowcentratedNotCalmError } from './error-types';
export declare class QuoteChangedError extends Error {
    constructor(message: string);
}
declare abstract class SerializableError extends Error {
    serialize(): SerializedError;
}
export declare class QuoteCowcentratedNoSingleSideError extends SerializableError {
    static readonly name = "QuoteCowcentratedNoSingleSideError";
    readonly name = "QuoteCowcentratedNoSingleSideError";
    readonly inputToken: string;
    readonly neededToken: string;
    constructor(inputs: TokenAmount[]);
    serialize(): SerializedQuoteCowcentratedNoSingleSideError;
    static match(error: SerializedError): error is SerializedQuoteCowcentratedNoSingleSideError;
}
export declare class QuoteCowcentratedNotCalmError extends SerializableError {
    readonly action: 'deposit' | 'withdraw';
    static readonly name = "QuoteCowcentratedNotCalmError";
    readonly name = "QuoteCowcentratedNotCalmError";
    constructor(action: 'deposit' | 'withdraw');
    serialize(): SerializedQuoteCowcentratedNotCalmError;
    static match(error: SerializedError): error is SerializedQuoteCowcentratedNotCalmError;
}
export declare class CrossChainBridgeBelowFeeError extends SerializableError {
    static readonly name = "CrossChainBridgeBelowFeeError";
    readonly name = "CrossChainBridgeBelowFeeError";
    static match(error: SerializedError): boolean;
}
export declare function isSerializableError(error: unknown): error is SerializableError;
export declare function serializeError(error: unknown): SerializedError;
export {};
