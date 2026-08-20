export type UseCopyToClipboardOptions = {
    /** set result back to idle after this many ms */
    clearResultAfter?: number | null;
    /** mark copy as failed after this many ms */
    timeoutAfter?: number;
};
export type UseCopyToClipboardReturn = {
    status: 'idle' | 'pending' | 'success' | 'error';
    error: string | undefined;
    copy: (text: string) => void;
    reset: () => void;
};
export declare function useCopyToClipboard({ clearResultAfter, timeoutAfter, }?: UseCopyToClipboardOptions): UseCopyToClipboardReturn;
