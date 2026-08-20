import { type PayloadAction } from '@reduxjs/toolkit';
import type { BeefyAnyBridgeConfig } from '../../apis/config-types';
import type { InputTokenAmount } from '../../apis/transact/transact-types';
import type { ChainEntity } from '../../entities/chain';
import { type TokenErc20 } from '../../entities/token';
import { type BridgeState, FormStep } from './bridge-types';
export declare const bridgeSlice: import("@reduxjs/toolkit").Slice<BridgeState, {
    setStep(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<{
        step: FormStep;
    }>): void;
    reverseDirection(sliceState: import("immer").WritableDraft<BridgeState>): void;
    setFromChain(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<{
        chainId: ChainEntity["id"];
    }>): void;
    setToChain(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<{
        chainId: ChainEntity["id"];
    }>): void;
    setInputAmount(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<InputTokenAmount<TokenErc20>>): void;
    setReceiverIsDifferent(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<boolean>): void;
    setReceiverAddress(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<string | undefined>): void;
    selectQuote(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<{
        quoteId: BeefyAnyBridgeConfig["id"];
    }>): void;
    unselectQuote(sliceState: import("immer").WritableDraft<BridgeState>): void;
    restart(sliceState: import("immer").WritableDraft<BridgeState>): void;
}, "bridge", "bridge", import("@reduxjs/toolkit").SliceSelectors<BridgeState>>;
export declare const bridgeActions: import("@reduxjs/toolkit").CaseReducerActions<{
    setStep(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<{
        step: FormStep;
    }>): void;
    reverseDirection(sliceState: import("immer").WritableDraft<BridgeState>): void;
    setFromChain(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<{
        chainId: ChainEntity["id"];
    }>): void;
    setToChain(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<{
        chainId: ChainEntity["id"];
    }>): void;
    setInputAmount(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<InputTokenAmount<TokenErc20>>): void;
    setReceiverIsDifferent(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<boolean>): void;
    setReceiverAddress(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<string | undefined>): void;
    selectQuote(sliceState: import("immer").WritableDraft<BridgeState>, action: PayloadAction<{
        quoteId: BeefyAnyBridgeConfig["id"];
    }>): void;
    unselectQuote(sliceState: import("immer").WritableDraft<BridgeState>): void;
    restart(sliceState: import("immer").WritableDraft<BridgeState>): void;
}, "bridge">;
