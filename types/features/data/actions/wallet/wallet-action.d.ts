import type { Hash, TransactionReceipt } from 'viem';
import { type BridgeAdditionalData, type TrxError, type TxAdditionalData, type WalletActionsErrorState, type WalletActionsIdleState, type WalletActionsPendingState, type WalletActionsState, type WalletActionsSuccessState } from '../../reducers/wallet/wallet-action-types';
export declare function isWalletActionIdle(state: WalletActionsState): state is WalletActionsIdleState;
export declare function isWalletActionError(state: WalletActionsState): state is WalletActionsErrorState;
export declare function isWalletActionPending(state: WalletActionsState): state is WalletActionsPendingState;
export declare function isWalletActionSuccess(state: WalletActionsState): state is WalletActionsSuccessState;
export declare function isWalletActionBridgeSuccess(state: WalletActionsState): state is WalletActionsSuccessState<BridgeAdditionalData>;
export type WalletAction<T extends WalletActionsState> = {
    type: 'WALLET_ACTION';
    payload: T;
};
export declare function createWalletActionResetAction(): {
    type: string;
    payload: {
        result: undefined;
        data: undefined;
    };
};
export declare function createWalletActionErrorAction(error: TrxError, additionalData: TxAdditionalData | undefined): WalletAction<WalletActionsErrorState>;
export declare function createWalletActionPendingAction(hash: Hash, additionalData: TxAdditionalData | undefined): WalletAction<WalletActionsPendingState>;
export declare function createWalletActionSuccessAction(receipt: TransactionReceipt, additionalData: TxAdditionalData | undefined): WalletAction<WalletActionsSuccessState>;
