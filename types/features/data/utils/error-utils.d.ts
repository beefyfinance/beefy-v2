export declare class FriendlyError extends Error {
    protected innerError: Error;
    constructor(message: string, innerError: Error);
    getInnerError(): Error;
}
