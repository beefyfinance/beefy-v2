import type BigNumber from 'bignumber.js';
import { WALLET_ACTION, WALLET_ACTION_RESET } from '../../actions/wallet-actions';
import type { TokenEntity } from '../../entities/token';
import type { EventLog } from 'web3-core';
import type { VaultEntity } from '../../entities/vault';
import type { IBridgeQuote } from '../../apis/bridge/providers/provider-types';
import type { BeefyAnyBridgeConfig } from '../../apis/config-types';

export type TrxHash = string;
export type TrxReceipt = {
  readonly transactionHash: string;
  readonly from: string;
  readonly to: string;
  readonly events?: {
    [eventName: string]: EventLog | EventLog[];
  };
};
export type TrxError = {
  message: string;
  friendlyMessage?: string;
};

export type BaseAdditionalData = {
  amount: BigNumber;
  token: TokenEntity;
};

export type VaultAdditionalData = BaseAdditionalData;

export type MigrateAdditionalData = BaseAdditionalData & {
  spender: string;
};

export type ZapAdditionalData = BaseAdditionalData & {
  /** Zap type */
  type: 'zap';
  /** Vault zap is on */
  vaultId: VaultEntity['id'];
  /** Expected tokens returned to user */
  expectedTokens: TokenEntity[];
};

export type BridgeAdditionalData = BaseAdditionalData & {
  type: 'bridge';
  quote: IBridgeQuote<BeefyAnyBridgeConfig>;
};

export type TxAdditionalData =
  | VaultAdditionalData
  | ZapAdditionalData
  | MigrateAdditionalData
  | BridgeAdditionalData;

export function isZapAdditionalData(data: TxAdditionalData): data is ZapAdditionalData {
  return 'type' in data && data.type === 'zap';
}

export function isBridgeAdditionalData(data: TxAdditionalData): data is BridgeAdditionalData {
  return 'type' in data && data.type === 'bridge';
}

export type WalletActionsIdleState = {
  result: null;
  data: null;
};

export type WalletActionsErrorState<T extends TxAdditionalData = TxAdditionalData> = {
  result: 'error';
  data: {
    error: TrxError;
  } & T;
};

export type WalletActionsPendingState<T extends TxAdditionalData = TxAdditionalData> = {
  result: 'success_pending';
  data: {
    hash: TrxHash;
  } & T;
};

export type WalletActionsSuccessState<T extends TxAdditionalData = TxAdditionalData> = {
  result: 'success';
  data: {
    hash: TrxHash;
    receipt: TrxReceipt;
  } & T;
};

export type WalletActionsState =
  | WalletActionsIdleState
  | WalletActionsErrorState
  | WalletActionsPendingState
  | WalletActionsSuccessState;

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
  return isWalletActionSuccess(state) && isBridgeAdditionalData(state.data);
}

export type WalletAction<T extends WalletActionsState> = {
  type: 'WALLET_ACTION';
  payload: T;
};

const initialWalletActionState: WalletActionsState = {
  result: null,
  data: null,
};

export const walletActionsReducer = (
  state = initialWalletActionState,
  action: { type: 'WALLET_ACTION' | 'WALLET_ACTION_RESET'; payload: WalletActionsState }
): WalletActionsState => {
  switch (action.type) {
    case WALLET_ACTION:
      return action.payload;
    case WALLET_ACTION_RESET:
      return { result: null, data: null };
    default:
      return state;
  }
};

export function createWalletActionResetAction() {
  return {
    type: WALLET_ACTION_RESET,
    payload: {
      result: null,
      data: null,
    },
  };
}

export function createWalletActionErrorAction(
  error: TrxError,
  additionalData: TxAdditionalData
): WalletAction<WalletActionsErrorState> {
  return {
    type: WALLET_ACTION,
    payload: {
      result: 'error',
      data: {
        error,
        ...additionalData,
      },
    },
  };
}

export function createWalletActionPendingAction(
  hash: TrxHash,
  additionalData: TxAdditionalData
): WalletAction<WalletActionsPendingState> {
  return {
    type: WALLET_ACTION,
    payload: {
      result: 'success_pending',
      data: {
        hash,
        ...additionalData,
      },
    },
  };
}

export function createWalletActionSuccessAction(
  receipt: TrxReceipt,
  additionalData: TxAdditionalData
): WalletAction<WalletActionsSuccessState> {
  return {
    type: WALLET_ACTION,
    payload: {
      result: 'success',
      data: {
        hash: receipt.transactionHash,
        receipt,
        ...additionalData,
      },
    },
  };
}
