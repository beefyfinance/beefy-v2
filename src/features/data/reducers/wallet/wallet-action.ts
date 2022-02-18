import { WALLET_ACTION, WALLET_ACTION_RESET } from '../../actions/wallet-actions';

export interface WalletActionsState {
  // todo: proper typings
  result: any; // 'error' | 'success_pending'
  data: any; // {error: string} | { receipt: {transactionHash: string } } | { amount: BigNumber }
}

const initialWalletActionState = {
  result: null,
  data: null,
};

export const walletActionsReducer = (state = initialWalletActionState, action) => {
  switch (action.type) {
    case WALLET_ACTION:
      return {
        result: action.payload.result,
        data: action.payload.data,
      };
    case WALLET_ACTION_RESET:
      return { result: null, data: null };
    default:
      return state;
  }
};
