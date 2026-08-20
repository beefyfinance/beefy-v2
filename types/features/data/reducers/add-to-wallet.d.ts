import type { AddToWalletState } from './add-to-wallet-types';
export declare const addToWalletSlice: import("@reduxjs/toolkit").Slice<AddToWalletState, {
    close: (sliceState: import("immer").WritableDraft<AddToWalletState>) => void;
}, "addToWallet", "addToWallet", import("@reduxjs/toolkit").SliceSelectors<AddToWalletState>>;
export declare const addToWalletActions: import("@reduxjs/toolkit").CaseReducerActions<{
    close: (sliceState: import("immer").WritableDraft<AddToWalletState>) => void;
}, "addToWallet">;
