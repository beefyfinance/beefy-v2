import { type BigNumber } from 'bignumber.js';
import { WALLET_ACTION, WALLET_ACTION_RESET } from '../../actions/wallet-actions';
import type { TokenEntity } from '../../entities/token';
import type { VaultEntity } from '../../entities/vault';
import type { IBridgeQuote } from '../../apis/bridge/providers/provider-types';
import type { BeefyAnyBridgeConfig } from '../../apis/config-types';
import type { BoostEntity } from '../../entities/boost';
import type { Hash, TransactionReceipt } from 'viem';

export type TrxHash = string;
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

export type BoostAdditionalData = BaseAdditionalData & {
  type: 'boost';
  boostId: BoostEntity['id'];
  walletAddress: string;
};

export type TxAdditionalData =
  | VaultAdditionalData
  | ZapAdditionalData
  | MigrateAdditionalData
  | BridgeAdditionalData
  | BoostAdditionalData;

export function isZapAdditionalData(data: TxAdditionalData | undefined): data is ZapAdditionalData {
  return !!data && 'type' in data && data.type === 'zap';
}

export function isBridgeAdditionalData(
  data: TxAdditionalData | undefined
): data is BridgeAdditionalData {
  return !!data && 'type' in data && data.type === 'bridge';
}

export function isBoostAdditionalData(
  data: TxAdditionalData | undefined
): data is BoostAdditionalData {
  return !!data && 'type' in data && data.type === 'boost';
}

export function isBaseAdditionalData(
  data: TxAdditionalData | undefined
): data is BaseAdditionalData {
  return !!data && 'amount' in data && 'token' in data;
}

export type WalletActionsIdleState = {
  result: undefined;
  data: undefined;
  additional: undefined;
};

export type WalletActionsErrorState<T extends TxAdditionalData = TxAdditionalData> = {
  result: 'error';
  data: {
    error: TrxError;
  };
  additional?: T;
};

export type WalletActionsPendingState<T extends TxAdditionalData = TxAdditionalData> = {
  result: 'success_pending';
  data: { hash: TrxHash };
  additional?: T;
};

export type WalletActionsSuccessState<T extends TxAdditionalData = TxAdditionalData> = {
  result: 'success';
  data: {
    hash: Hash;
    receipt: TransactionReceipt;
  };
  additional?: T;
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
  return (
    isWalletActionSuccess(state) && !!state.additional && isBridgeAdditionalData(state.additional)
  );
}

export type WalletAction<T extends WalletActionsState> = {
  type: 'WALLET_ACTION';
  payload: T;
};

const initialWalletActionState: WalletActionsState = {
  result: undefined,
  data: undefined,
  additional: undefined,
};

export const walletActionsReducer = (
  state = initialWalletActionState,
  action: { type: 'WALLET_ACTION' | 'WALLET_ACTION_RESET'; payload: WalletActionsState }
): WalletActionsState => {
  switch (action.type) {
    case WALLET_ACTION:
      return action.payload;
    case WALLET_ACTION_RESET:
      return { result: undefined, data: undefined, additional: undefined };
    default:
      return state;
  }
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
