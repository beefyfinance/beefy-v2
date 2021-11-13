import {
  BALANCE_FETCH_BALANCES_BEGIN,
  BALANCE_FETCH_BALANCES_DONE,
  BALANCE_FETCH_REWARDS_BEGIN,
  BALANCE_FETCH_REWARDS_DONE,
  WALLET_DISCONNECT,
} from '../constants';
import { config } from '../../../config/config';
import { getEligibleZap } from '../../../helpers/zap';

const initialTokens = () => {
  const tokens = [];
  for (let net in config) {
    tokens[net] = [];
    const data = require(`../../../config/vault/${net}`);
    for (const key in data.pools) {
      if (data.pools[key].isGovVault) {
        let tSymbol = data.pools[key].token + 'GovVault';
        tokens[net][tSymbol] = {
          ...tokens[net][data.pools[key].symbol],
          symbol: tSymbol,
          decimals: data.pools[key].tokenDecimals,
          allowance: {
            [data.pools[key].tokenAddress]: 0,
          },
          isGovVault: true,
          address: data.pools[key].tokenAddress,
          poolAddress: data.pools[key].poolAddress,
          baseSymbol: data.pools[key].token,
        };
        if (!tokens[net][data.pools[key].token]) {
          tokens[net][data.pools[key].token] = {
            ...tokens[net][data.pools[key].token],
            symbol: data.pools[key].token,
            balance: 0,
            decimals: data.pools[key].tokenDecimals,
            address: data.pools[key].tokenAddress,
            allowance: {
              ...tokens[net][data.pools[key].token]?.allowance,
              [data.pools[key].earnContractAddress]: 0,
            },
          };
        }
      } else {
        tokens[net][data.pools[key].token] = {
          ...tokens[net][data.pools[key].token],
          symbol: data.pools[key].token,
          balance: 0,
          decimals: data.pools[key].tokenDecimals,
          allowance: {
            ...tokens[net][data.pools[key].token]?.allowance,
            [data.pools[key].earnContractAddress]: 0,
          },
        };

        if (data.pools[key].tokenAddress) {
          tokens[net][data.pools[key].token]['address'] = data.pools[key].tokenAddress;
        }

        tokens[net][data.pools[key].earnedToken] = {
          ...tokens[net][data.pools[key].earnedToken],
          symbol: data.pools[key].earnedToken,
          balance: 0,
          decimals: 18,
          address: data.pools[key].earnedTokenAddress,
          allowance: {
            ...tokens[net][data.pools[key].earnedToken]?.allowance,
          },
        };

        const zap = getEligibleZap(data.pools[key]);
        if (zap) {
          for (const ti in zap.tokens) {
            tokens[net][zap.tokens[ti].symbol] = {
              ...tokens[net][zap.tokens[ti].symbol],
              symbol: zap.tokens[ti].symbol,
              balance: 0,
              decimals: zap.tokens[ti].decimals,
              address: zap.tokens[ti].address,
              allowance: {
                ...tokens[net][zap.tokens[ti].symbol]?.allowance,
                [zap.address]: 0,
              },
            };
          }
          tokens[net][data.pools[key].earnedToken]['allowance'] = {
            ...tokens[net][data.pools[key].earnedToken]['allowance'],
            [zap.address]: 0,
          };
        }
      }
    }

    const boosts = require(`../../../config/boost/${net}`);
    for (const key in boosts.pools) {
//      if (boosts.pools[key].token === 'BIFI') continue; // Skip gov pools
			if (!boosts.pools[key].token)
				continue;

      const boostSymbol = boosts.pools[key].token + boosts.pools[key].id + 'Boost';
      tokens[net][boostSymbol] = {
        symbol: boostSymbol,
        balance: 0,
        decimals: 18,
        network: net,
        allowance: { [data.pools[key].earnContractAddress]: 0 },
      };

      tokens[net][boostSymbol]['allowance'] = {
        ...tokens[net][boostSymbol]['allowance'],
        [boosts.pools[key].earnContractAddress]: 0,
      };
		} //for (const key in boosts.pools)
	} //for (let net in config)

  return tokens;
}; //const initialTokens = () =>


const initialState = {
  tokens: initialTokens(),
  rewards: [],
  lastUpdated: 0,
  isBalancesLoading: false,
  isBalancesFirstTime: true,
  isRewardsLoading: false,
};

export const balanceReducer = (state = initialState, action) => {
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
    case BALANCE_FETCH_REWARDS_BEGIN:
      return {
        ...state,
        isRewardsLoading: true,
      };
    case BALANCE_FETCH_REWARDS_DONE:
      return {
        ...state,
        rewards: action.payload.rewards,
        lastUpdated: action.payload.lastUpdated,
        isRewardsLoading: false,
      };
    case WALLET_DISCONNECT:
      return { ...initialState, tokens: initialTokens() };
    default:
      return state;
  }
};
