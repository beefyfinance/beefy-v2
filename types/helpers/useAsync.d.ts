import type { SerializedError } from '@reduxjs/toolkit';
type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';
type AsyncReturnType<T> = {
    execute: () => void;
    status: AsyncStatus;
    value: T | null;
    error: SerializedError | null;
};
export declare function useAsync<T>(asyncFunction: () => Promise<T>, initialValue?: T | null, immediate?: boolean): AsyncReturnType<T>;
export {};
