import Web3 from 'web3';

import { WALLET_ACTION, WALLET_ACTION_RESET } from '../constants';

const initialState = {
  action: { result: null, data: null },
};

export const walletReducer = (state = initialState, action) => {
  switch (action.type) {
    case WALLET_ACTION:
      return {
        ...state,
        action: {
          result: action.payload.result,
          data: action.payload.data,
        },
      };
    case WALLET_ACTION_RESET:
      return {
        ...state,
        action: { result: null, data: null },
      };
    default:
      return state;
  }
};
