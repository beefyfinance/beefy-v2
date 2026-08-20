import { type FetchResponseError } from '../../../../helpers/http/errors';
export declare class TenderlyError extends Error {
    constructor(message: string, cause?: FetchResponseError);
}
export declare class TenderlyBadRequestError extends TenderlyError {
    constructor(cause: FetchResponseError, message?: string);
}
export declare class TenderlyUnauthorizedError extends TenderlyError {
    constructor(cause: FetchResponseError, message?: string);
}
export declare class TenderlyRequestFailedError extends TenderlyError {
    constructor(cause: FetchResponseError, message?: string);
}
export declare class TenderlyForbiddenError extends TenderlyError {
    constructor(cause: FetchResponseError, message?: string);
}
export declare class TenderlyInvalidResponseFormatError extends TenderlyError {
    constructor(message?: string);
}
export declare function errorToTenderlyError(cause: unknown): Promise<TenderlyError | undefined>;
