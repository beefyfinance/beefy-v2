import type { Namespace, TFunction } from 'react-i18next';
import type { UserlessZapRequest } from '../../apis/transact/zap/types';
import { type TokenEntity } from '../../entities/token';
import type { VaultEntity } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
import type { BeefyState, BeefyThunk } from '../../store/types';
import type { CrossChainOpStatus, CrossChainRecoveryParams, PendingCrossChainOp } from '../../reducers/wallet/transact-types';
import type { RecoveryQuote, TokenAmount, ZapQuoteStep } from '../../apis/transact/transact-types';
/** Kick off a gas price fetch that can be consumed later by crossChainZapExecuteOrder */
export declare function prefetchGasPrice(chain: ChainEntity): void;
export type CrossChainExecuteMetadata = {
    opId: string;
    direction: 'deposit' | 'withdraw';
    sourceChainId: ChainEntity['id'];
    destChainId: ChainEntity['id'];
    vaultId: VaultEntity['id'];
    sourceInput: TokenAmount;
    expectedOutput: TokenAmount;
    sourceDisplaySteps: ZapQuoteStep[];
    destDisplaySteps: ZapQuoteStep[];
    recovery: CrossChainRecoveryParams;
    twoStep?: boolean;
};
/**
 * Execute a zap order on a source chain different from the vault's chain.
 * Modeled after zapExecuteOrder but uses sourceChainId for chain/zap/rpc lookups.
 */
export declare const crossChainZapExecuteOrder: (sourceChainId: ChainEntity["id"], vaultId: VaultEntity["id"], params: UserlessZapRequest, expectedTokens: TokenEntity[], metadata: CrossChainExecuteMetadata) => BeefyThunk;
/**
 * Execute a recovery zap order on the destination chain.
 * Used when the destination portion of a cross-chain zap has failed.
 */
export declare const crossChainRecoveryExecuteOrder: (opId: string, destChainId: ChainEntity["id"], vaultId: VaultEntity["id"], params: UserlessZapRequest, expectedTokens: TokenEntity[]) => BeefyThunk;
export declare const crossChainOpInitiated: import("@reduxjs/toolkit").ActionCreatorWithPayload<PendingCrossChainOp, string>;
export declare const crossChainOpStatusUpdate: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
    status: CrossChainOpStatus;
    destTxHash?: string;
    sourceTxHash?: string;
    recoveryBridgedAmount?: string;
}, string>;
export declare const crossChainOpDismiss: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
}, string>;
export declare const crossChainClearRecoveryQuote: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"cross-chain/clearRecoveryQuote">;
export declare const crossChainMarkRecoveryQuoteStale: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"cross-chain/markRecoveryQuoteStale">;
type CrossChainFetchRecoveryQuotePayload = {
    quote: RecoveryQuote;
};
type CrossChainFetchRecoveryQuoteArgs = {
    opId: string;
};
export declare const crossChainFetchRecoveryQuote: import("@reduxjs/toolkit").AsyncThunk<CrossChainFetchRecoveryQuotePayload, CrossChainFetchRecoveryQuoteArgs, {
    state: BeefyState;
    dispatch: import("../../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare function crossChainRecoverySteps(opId: string, t: TFunction<Namespace>): BeefyThunk;
export {};
