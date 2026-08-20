export declare class FetchError extends Error {
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
export declare class FetchResponseError extends FetchError {
    readonly response: Response;
    constructor(response: Response, message?: string, cause?: Error);
}
export declare class FetchResponseDecodeError extends FetchResponseError {
    constructor(response: Response, cause?: Error);
}
export declare class FetchResponseBodyTextError extends FetchResponseError {
    constructor(response: Response, cause?: Error);
}
export declare class FetchResponseNotJsonError extends FetchResponseError {
    constructor(response: Response, cause?: Error);
}
export declare class FetchResponseJsonParseError extends FetchResponseError {
    constructor(response: Response, cause?: Error);
}
export declare class FetchTimeoutError extends FetchError {
    constructor(cause: Error);
}
export declare class FetchAbortError extends FetchError {
    constructor(cause: Error);
}
export declare function isFetchError(value: unknown): value is FetchError;
export declare function isFetchResponseError(value: unknown): value is FetchResponseError;
export declare function isFetchNotFoundError(value: unknown): value is FetchResponseError;
export declare function isFetchResponseNotJsonError(value: unknown): value is FetchResponseNotJsonError;
export declare function isFetchResponseJsonParseError(value: unknown): value is FetchResponseJsonParseError;
export declare function isFetchTimeoutError(value: unknown): value is FetchTimeoutError;
export declare function isFetchAbortError(value: unknown): value is FetchAbortError;
