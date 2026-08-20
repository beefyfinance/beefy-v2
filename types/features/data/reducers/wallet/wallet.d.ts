import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChainEntity } from '../../entities/chain';
import type { WalletState } from './wallet-types';
export declare const walletSlice: import("@reduxjs/toolkit").Slice<WalletState, {
    /**
     * Wallet connection/disconnect actions
     */
    userDidConnect(sliceState: import("immer").WritableDraft<WalletState>, action: PayloadAction<{
        chainId: ChainEntity["id"];
        address: string;
    }>): void;
    walletHasDisconnected(sliceState: import("immer").WritableDraft<WalletState>): void;
    accountHasChanged(sliceState: import("immer").WritableDraft<WalletState>, action: PayloadAction<{
        address: string;
    }>): void;
    chainHasChanged(sliceState: import("immer").WritableDraft<WalletState>, action: PayloadAction<{
        chainId: ChainEntity["id"];
        address: string;
    }>): void;
    chainHasChangedToUnsupported(sliceState: import("immer").WritableDraft<WalletState>, action: PayloadAction<{
        networkChainId: string | number;
        address: string;
    }>): void;
    /**
     * Display configuration
     */
    setToggleHideBalance(sliceState: import("immer").WritableDraft<WalletState>): void;
}, "wallet", "wallet", import("@reduxjs/toolkit").SliceSelectors<WalletState>>;
export declare const walletHasDisconnected: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"wallet/walletHasDisconnected">, accountHasChanged: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    address: string;
}, "wallet/accountHasChanged">, chainHasChanged: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    chainId: ChainEntity["id"];
    address: string;
}, "wallet/chainHasChanged">, chainHasChangedToUnsupported: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    networkChainId: string | number;
    address: string;
}, "wallet/chainHasChangedToUnsupported">, userDidConnect: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    chainId: ChainEntity["id"];
    address: string;
}, "wallet/userDidConnect">, setToggleHideBalance: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"wallet/setToggleHideBalance">;
