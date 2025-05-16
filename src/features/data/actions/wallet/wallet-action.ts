import type { Hash, TransactionReceipt } from 'viem';
import {
  type BridgeAdditionalData,
  isBridgeAdditionalData,
  type TrxError,
  type TxAdditionalData,
  WALLET_ACTION,
  WALLET_ACTION_RESET,
  type WalletActionsErrorState,
  type WalletActionsIdleState,
  type WalletActionsPendingState,
  type WalletActionsState,
  type WalletActionsSuccessState,
} from '../../reducers/wallet/wallet-action-types.ts';

export function isWalletActionIdle(state: WalletActionsState): state is WalletActionsIdleState {
  return state.result === null;
}

export function isWalletActionError(state: WalletActionsState): state is WalletActionsErrorState {
  return state.result === 'error';
}

export function isWalletActionPending(
  state: WalletActionsState
): state is WalletActionsPendingState {
  return state.result === 'success_pending';
}

export function isWalletActionSuccess(
  state: WalletActionsState
): state is WalletActionsSuccessState {
  return state.result === 'success';
}

export function isWalletActionBridgeSuccess(
  state: WalletActionsState
): state is WalletActionsSuccessState<BridgeAdditionalData> {
  return (
    isWalletActionSuccess(state) && !!state.additional && isBridgeAdditionalData(state.additional)
  );
}

export type WalletAction<T extends WalletActionsState> = {
  type: 'WALLET_ACTION';
  payload: T;
};

export function createWalletActionResetAction() {
  return {
    type: WALLET_ACTION_RESET,
    payload: {
      result: undefined,
      data: undefined,
    },
  };
}

export function createWalletActionErrorAction(
  error: TrxError,
  additionalData: TxAdditionalData | undefined
): WalletAction<WalletActionsErrorState> {
  return {
    type: WALLET_ACTION,
    payload: {
      result: 'error',
      data: {
        error,
      },
      additional: additionalData,
    },
  };
}

export function createWalletActionPendingAction(
  hash: Hash,
  additionalData: TxAdditionalData | undefined
): WalletAction<WalletActionsPendingState> {
  return {
    type: WALLET_ACTION,
    payload: {
      result: 'success_pending',
      data: {
        hash,
      },
      additional: additionalData,
    },
  };
}

export function createWalletActionSuccessAction(
  receipt: TransactionReceipt,
  additionalData: TxAdditionalData | undefined
): WalletAction<WalletActionsSuccessState> {
  return {
    type: WALLET_ACTION,
    payload: {
      result: 'success',
      data: {
        hash: receipt.transactionHash,
        receipt,
      },
      additional: additionalData,
    },
  };
}
