import { type PayloadAction } from '@reduxjs/toolkit';
import type { TokenEntity } from '../entities/token';
import type { TokensState } from './tokens-types';
export declare const initialTokensState: TokensState;
export declare const tokensSlice: import("@reduxjs/toolkit").Slice<TokensState, {
    addToken: (sliceState: import("immer").WritableDraft<TokensState>, action: PayloadAction<{
        token: TokenEntity;
        interesting: boolean;
        override?: boolean;
    }>) => void;
}, "tokens", "tokens", import("@reduxjs/toolkit").SliceSelectors<TokensState>>;
export declare const addToken: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    token: TokenEntity;
    interesting: boolean;
    override?: boolean;
}, "tokens/addToken">;
