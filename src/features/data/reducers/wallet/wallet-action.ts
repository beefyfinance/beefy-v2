import {
  WALLET_ACTION,
  WALLET_ACTION_RESET,
  type WalletActionsState,
} from './wallet-action-types.ts';

const initialWalletActionState: WalletActionsState = {
  result: undefined,
  data: undefined,
  additional: undefined,
};

export const walletActionsReducer = (
  state: WalletActionsState = initialWalletActionState,
  action: {
    type: 'WALLET_ACTION' | 'WALLET_ACTION_RESET';
    payload: WalletActionsState;
  }
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
