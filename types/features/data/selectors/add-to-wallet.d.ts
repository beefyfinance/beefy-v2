import type { BeefyState } from '../store/types';
export declare const selectAddToWalletStatus: (state: BeefyState) => "idle" | "pending" | "fulfilled" | "rejected";
export declare const selectAddToWalletError: (state: BeefyState) => import("@reduxjs/toolkit").SerializedError | null;
export declare const selectAddToWalletSymbol: (state: BeefyState) => string | null | undefined;
export declare const selectAddToWalletIconUrl: (state: BeefyState) => string | null;
export declare const selectAddToWalletToken: (state: BeefyState) => import("../entities/token").TokenErc20 | import("../entities/token").TokenNative;
