import type { ChainEntity } from '../../entities/chain';
import { type BridgeStatus, type Step, StepContent } from '../../reducers/wallet/stepper-types';
import type { BeefyThunk } from '../../store/types';
export declare const stepperReset: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"stepper/reset">;
export declare const stepperAddStep: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    step: Step;
}, string>;
export declare const stepperUpdateCurrentStep: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    pending: boolean;
}, string>;
export declare const stepperUpdateCurrentStepIndex: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    stepIndex: number;
}, string>;
export declare const stepperSetModel: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    modal: boolean;
}, string>;
export declare const stepperSetChainId: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    chainId: ChainEntity["id"];
}, string>;
export declare const stepperSetStepContent: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    stepContent: StepContent;
}, string>;
export declare const stepperSetBridgeStatus: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<BridgeStatus>, string>;
export declare const stepperSetRecoveryExecution: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, string>;
export interface StarStepperPayload {
    chainId: ChainEntity['id'];
    stepIndex: number;
    modal: boolean;
}
export declare const stepperStart: import("@reduxjs/toolkit").AsyncThunk<StarStepperPayload, "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", {
    state: import("../../store/types").BeefyState;
    dispatch: import("../../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const stepperUpdate: import("@reduxjs/toolkit").AsyncThunk<void, void, {
    state: import("../../store/types").BeefyState;
    dispatch: import("../../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare function stepperStartWithSteps(steps: Step[], chainId: ChainEntity['id']): BeefyThunk;
