import { MultiCall } from 'eth-multicall';
import { BALANCE_FETCH_BALANCES_BEGIN, BALANCE_FETCH_BALANCES_DONE } from '../constants';
import { config } from 'config/config';
import { isEmpty } from 'helpers/utils';

const erc20Abi = require('config/abi/erc20.json');
const multicallAbi = require('config/abi/multicall.json');

const getBalancesSingle = async (item, state, dispatch) => {
  console.log('redux getBalancesSingle() processing...');
  const address = state.walletReducer.address;
  const web3 = state.walletReducer.rpc;
  const multicall = new MultiCall(web3[item.network], config[item.network].multicallAddress);
  const calls = [];
  const allowance = [];

  if (isEmpty(item.tokenAddress)) {
    const tokenContract = new web3[item.network].eth.Contract(multicallAbi, multicall.contract);
    calls.push({
      amount: tokenContract.methods.getEthBalance(address),
      token: item.token,
    });
  } else {
    const tokenContract = new web3[item.network].eth.Contract(erc20Abi, item.tokenAddress);
    calls.push({
      amount: tokenContract.methods.balanceOf(address),
      token: item.token,
      address: item.tokenAddress,
    });

    const earnedTokenContract = new web3[item.network].eth.Contract(
      erc20Abi,
      item.earnedTokenAddress
    );
    calls.push({
      amount: earnedTokenContract.methods.balanceOf(address),
      token: item.earnedToken,
      address: item.earnedTokenAddress,
    });

    allowance.push({
      allowance: tokenContract.methods.allowance(address, item.earnContractAddress),
      token: item.token,
      spender: item.earnContractAddress,
    });
  }

  const tokens = state.balanceReducer.tokens;
  const response = await multicall.all([calls]);
  const allow = await multicall.all([allowance]);

  for (let index in response[0]) {
    const item = response[0][index];
    tokens[item.token].balance = item.amount;
    tokens[item.token].address = item.address;
  }

  for (let index in allow[0]) {
    const item = allow[0][index];
    tokens[item.token].allowance = {
      [item.spender]: parseInt(item.allowance),
    };
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

const getBalancesAll = async (state, dispatch) => {
  console.log('redux getBalancesAll() processing...');
  const address = state.walletReducer.address;
  const web3 = state.walletReducer.rpc;
  const pools = state.vaultReducer.pools;

  const multicall = [];
  const calls = [];

  for (let key in web3) {
    multicall[key] = new MultiCall(web3[key], config[key].multicallAddress);
    calls[key] = [];
  }

  for (let key in pools) {
    if (isEmpty(pools[key].tokenAddress)) {
      const tokenContract = new web3[pools[key].network].eth.Contract(
        multicallAbi,
        multicall[pools[key].network].contract
      );
      calls[pools[key].network].push({
        amount: tokenContract.methods.getEthBalance(address),
        token: pools[key].token,
      });
    } else {
      const tokenContract = new web3[pools[key].network].eth.Contract(
        erc20Abi,
        pools[key].tokenAddress
      );
      calls[pools[key].network].push({
        amount: tokenContract.methods.balanceOf(address),
        token: pools[key].token,
        address: pools[key].tokenAddress,
      });

      const earnedTokenContract = new web3[pools[key].network].eth.Contract(
        erc20Abi,
        pools[key].earnedTokenAddress
      );
      calls[pools[key].network].push({
        amount: earnedTokenContract.methods.balanceOf(address),
        token: pools[key].earnedToken,
        address: pools[key].tokenAddress,
      });
    }
  }

  let response = [];

  for (let key in multicall) {
    const resp = await multicall[key].all([calls[key]]);
    response = [...response, ...resp[0]];
  }

  const tokens = state.balanceReducer.tokens;

  for (let index in response) {
    tokens[response[index].token] = {
      balance: response[index].amount,
      address: response[index].address,
      allowance: tokens[response[index].token].allowance,
    };
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

const fetchBalances = (item = false) => {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.walletReducer.address) {
      dispatch({ type: BALANCE_FETCH_BALANCES_BEGIN });
      return item
        ? await getBalancesSingle(item, state, dispatch)
        : await getBalancesAll(state, dispatch);
    }
  };
};

const obj = {
  fetchBalances,
};

export default obj;
