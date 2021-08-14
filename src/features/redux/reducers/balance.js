import {
  BALANCE_FETCH_BALANCES_BEGIN,
  BALANCE_FETCH_BALANCES_DONE,
  WALLET_DISCONNECT,
} from '../constants';
import { config } from 'config/config';

const initialTokens = () => {
  const tokens = [];
  for (let net in config) {
    const data = require('config/vault/' + net + '.js');
    for (const key in data.pools) {
      tokens[data.pools[key].token] = {
        balance: 0,
        allowance: { [data.pools[key].earnContractAddress]: 0 },
      };

      if (data.pools[key].tokenAddress) {
        tokens[data.pools[key].token]['address'] = data.pools[key].tokenAddress;
      }

      tokens[data.pools[key].earnedToken] = {
        balance: 0,
        address: data.pools[key].earnedTokenAddress,
      };
    }
  }

  return tokens;
};

const initialState = {
  tokens: initialTokens(),
  lastUpdated: 0,
  isBalancesLoading: false,
  isBalancesFirstTime: true,
};

const balanceReducer = (state = initialState, action) => {
  switch (action.type) {
    case BALANCE_FETCH_BALANCES_BEGIN:
      return {
        ...state,
        isBalancesLoading: state.isBalancesFirstTime,
      };
    case BALANCE_FETCH_BALANCES_DONE:
      return {
        ...state,
        tokens: action.payload.tokens,
        lastUpdated: action.payload.lastUpdated,
        isBalancesLoading: false,
        isBalancesFirstTime: false,
      };
    case WALLET_DISCONNECT:
      return { ...initialState, tokens: initialTokens() };
    default:
      return state;
  }
};

export default balanceReducer;
