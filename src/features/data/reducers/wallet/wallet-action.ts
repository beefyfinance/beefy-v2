import BigNumber from 'bignumber.js';
import { WALLET_ACTION, WALLET_ACTION_RESET } from '../../actions/wallet-actions';
import { TokenEntity } from '../../entities/token';
import { EventLog } from 'web3-core';
import { VaultEntity } from '../../entities/vault';

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

export type MandatoryAdditionalData = {
  amount: BigNumber;
  token: TokenEntity;
};

export type OptionalAdditionalData = Partial<{
  vaultId: VaultEntity['id'];
}>;

export type WalletActionsState = {
  result: null | 'error' | 'success' | 'success_pending';
  data: {
    error: TrxError;
    receipt: TrxReceipt;
    hash: TrxHash;
  } & MandatoryAdditionalData &
    OptionalAdditionalData;
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

export function createWalletActionErrorAction(
  error: TrxError,
  additionalData: MandatoryAdditionalData
) {
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
  additionalData: MandatoryAdditionalData
) {
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
  additionalData: MandatoryAdditionalData
) {
  return {
    type: WALLET_ACTION,
    payload: {
      result: 'success',
      data: {
        receipt,
        ...additionalData,
      },
    },
  };
}
