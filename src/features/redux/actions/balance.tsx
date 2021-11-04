import { MultiCall } from 'eth-multicall';
import BigNumber from 'bignumber.js';
import {
  BALANCE_FETCH_BALANCES_BEGIN,
  BALANCE_FETCH_BALANCES_DONE,
  BALANCE_FETCH_REWARDS_BEGIN,
  BALANCE_FETCH_REWARDS_DONE,
} from '../constants';
import { config } from '../../../config/config';
import { isEmpty } from '../../../helpers/utils';
import { formatDecimals } from '../../../helpers/format';
import erc20Abi from '../../../config/abi/erc20.json';
import multicallAbi from '../../../config/abi/multicall.json';
import boostAbi from '../../../config/abi/boost.json';

const boostRegex = /^moo.*Boost$/;

const getBalances = async (state, dispatch) => {
  console.log('redux getBalances() processing...');
  const address = state.walletReducer.address;
  const web3 = state.walletReducer.rpc;

  const multicall = [];
  const calls = [];

  for (let net in web3) {
    multicall[net] = new MultiCall(web3[net], config[net].multicallAddress);
    calls[net] = [];

    for (let tokenSymbol in state.balanceReducer.tokens[net]) {
      if (boostRegex.test(tokenSymbol)) continue; // Skip Boost enties

      let token = state.balanceReducer.tokens[net][tokenSymbol];

      if (tokenSymbol === config[net].walletSettings.nativeCurrency.symbol) {
        const tokenContract = new web3[net].eth.Contract(multicallAbi, multicall[net].contract);
        calls[net].push({
          amount: tokenContract.methods.getEthBalance(address),
          token: tokenSymbol,
        });
      } else {
        const tokenContract = new web3[net].eth.Contract(erc20Abi, token.address);
        calls[net].push({
          amount: tokenContract.methods.balanceOf(address),
          token: tokenSymbol,
          address: token.address,
        });

        for (let spender in token.allowance) {
          calls[net].push({
            allowance: tokenContract.methods.allowance(address, spender),
            token: tokenSymbol,
            spender: spender,
          });
        }
      }
    }
  }

  const tokens = { ...state.balanceReducer.tokens };

  for (let key in multicall) {
    const response = (await multicall[key].all([calls[key]]))[0];

    for (let index in response) {
      const item = response[index];

      if (!isEmpty(item.amount)) {
        tokens[key][item.token].balance = item.amount;
        tokens[key][item.token].address = item.address;
      }

      if (!isEmpty(item.allowance)) {
        tokens[key][item.token].allowance = {
          ...tokens[key][item.token].allowance,
          [item.spender]: item.allowance,
        };
      }
    }
  }

  dispatch({
    type: BALANCE_FETCH_BALANCES_DONE,
    payload: {
      tokens: tokens,
      lastUpdated: new Date().getTime(),
    },
  });

  return true;
};

const getBoostBalances = async (items, state, dispatch, network) => {
  console.log('items', items);
  console.log('redux getBoostBalances() processing...');
  const address = state.walletReducer.address;
  const web3 = state.walletReducer.rpc;

  const multicall = [];
  const calls = [];

  if (network) {
    multicall[network] = new MultiCall(web3[network], config[network].multicallAddress);
    calls[network] = [];
  } else  {
    for (let key in web3) {
      multicall[key] = new MultiCall(web3[key], config[key].multicallAddress);
      calls[key] = [];
    }
  }

  const tokens = state.balanceReducer.tokens;

  for (let key in items) {
    if (network && items[key].network !== network) continue
    const boostToken = items[key].token + 'Boost';
    tokens[items[key].network][boostToken] = {
      ...tokens[items[key].network][boostToken],
      balance: 0,
    };

    const tokenContract = new web3[items[key].network].eth.Contract(
      erc20Abi,
      items[key].tokenAddress
    );
    const earnContract = new web3[items[key].network].eth.Contract(
      boostAbi,
      items[key].earnContractAddress
    );

    // Looks like these calls are refetching the mooToken balance of the user
    // calls[items[key].network].push({
    //   amount: tokenContract.methods.balanceOf(address),
    //   token: items[key].token,
    //   address: items[key].tokenAddress,
    // });

    calls[items[key].network].push({
      amount: earnContract.methods.balanceOf(address),
      token: items[key].token + 'Boost',
      address: items[key].tokenAddress,
      network: items[key].network,
    });

    calls[items[key].network].push({
      allowance: tokenContract.methods.allowance(address, items[key].earnContractAddress),
      token: items[key].token + 'Boost',
      spender: items[key].earnContractAddress,
      network: items[key].network,
    });
  }

  let response = [];

  for (let key in multicall) {
    const resp = await multicall[key].all([calls[key]]);
    response = [...response, ...resp[0]];
  }

  for (let index in response) {
    const item = response[index];

    if (!isEmpty(item.amount)) {
      const amount = BigNumber.sum(
        item.amount,
        tokens[item.network][item.token].balance
      ).toNumber();
      tokens[item.network][item.token].balance = formatDecimals(amount);
      tokens[item.network][item.token].address = item.address;
    }

    if (!isEmpty(item.allowance)) {
      tokens[item.network][item.token].allowance = {
        ...tokens[item.network][item.token].allowance,
        [item.spender]: item.allowance,
      };
    }
  }

  dispatch({
    type: BALANCE_FETCH_BALANCES_DONE,
    payload: {
      tokens: tokens,
      lastUpdated: new Date().getTime(),
    },
  });

  return true;
};

const getBoostRewards = async (items, state, dispatch, network) => {
  console.log('redux getBoostRewards() processing...');
  const address = state.walletReducer.address;
  const web3 = state.walletReducer.rpc;

  const multicall = [];
  const calls = [];
  const tokens = [];

  for (let key in web3) {
    multicall[key] = new MultiCall(web3[key], config[key].multicallAddress);
    calls[key] = [];
  }

  for (let key in items) {
    tokens[items[key].earnedToken] = {
      balance: 0,
      allowance: { [items[key].earnContractAddress]: 0 },
    };

    const earnContract = new web3[items[key].network].eth.Contract(
      boostAbi,
      items[key].earnContractAddress
    );

    calls[items[key].network].push({
      amount: earnContract.methods.earned(address),
      token: items[key].earnedToken,
      address: items[key].earnedTokenAddress,
    });
  }

  let response = [];

  for (let key in multicall) {
    const resp = await multicall[key].all([calls[key]]);
    response = [...response, ...resp[0]];
  }

  for (let index in response) {
    const item = response[index];

    if (!isEmpty(item.amount)) {
      tokens[item.token].balance = item.amount;
      tokens[item.token].address = item.address;
    }

    if (!isEmpty(item.allowance)) {
      tokens[item.token].allowance = {
        ...tokens[item.token].allowance,
        [item.spender]: item.allowance,
      };
    }
  }

  dispatch({
    type: BALANCE_FETCH_REWARDS_DONE,
    payload: {
      rewards: tokens,
      lastUpdated: new Date().getTime(),
    },
  });

  return true;
};

const fetchBalances = (item = false) => {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.walletReducer.address && state.balanceReducer.isBalancesLoading === false) {
      dispatch({ type: BALANCE_FETCH_BALANCES_BEGIN });
      return await getBalances(state, dispatch);
    }
  };
};

const fetchBoostBalances = (item = false, network = undefined) => {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.walletReducer.address) {
      const boosts = state.vaultReducer.boosts;
      dispatch({ type: BALANCE_FETCH_BALANCES_BEGIN });
      return await getBoostBalances(item ? [item] : boosts, state, dispatch, network);
    }
  };
};

const fetchBoostRewards = (item, network) => {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.walletReducer.address) {
      dispatch({ type: BALANCE_FETCH_REWARDS_BEGIN });
      return await getBoostRewards([item], state, dispatch, network);
    }
  };
};

export const balance = {
  fetchBalances,
  fetchBoostBalances,
  fetchBoostRewards,
};