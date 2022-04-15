import BigNumber from 'bignumber.js';
import { WALLET_ACTION, WALLET_ACTION_RESET } from '../../actions/wallet-actions';
import { TokenEntity } from '../../entities/token';
import { EventLog } from 'web3-core';

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

type MandatoryAdditionalData = {
  amount: BigNumber;
  token: TokenEntity;
};

export type WalletActionsState =
  | {
      result: null;
      data: null;
    }
  | {
      result: 'error';
      data: { error: TrxError } & MandatoryAdditionalData;
    }
  | {
      result: 'success';
      data: { receipt: TrxReceipt } & MandatoryAdditionalData;
    }
  | {
      result: 'success_pending';
      data: { hash: TrxHash } & MandatoryAdditionalData;
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
