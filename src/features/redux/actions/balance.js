import { MultiCall } from 'eth-multicall';
import { BALANCE_FETCH_BALANCES_BEGIN, BALANCE_FETCH_BALANCES_DONE } from '../constants';
import { config } from 'config/config';
import { isEmpty } from 'helpers/utils';

const erc20Abi = require('config/abi/erc20.json');
const multicallAbi = require('config/abi/multicall.json');

const getBalances = async (items, state, dispatch) => {
  console.log('redux getBalances() processing...');
  const address = state.walletReducer.address;
  const web3 = state.walletReducer.rpc;

  const multicall = [];
  const calls = [];

  for (let key in web3) {
    multicall[key] = new MultiCall(web3[key], config[key].multicallAddress);
    calls[key] = [];
  }

  for (let key in items) {
    if (isEmpty(items[key].tokenAddress)) {
      const tokenContract = new web3[items[key].network].eth.Contract(
        multicallAbi,
        multicall[items[key].network].contract
      );
      calls[items[key].network].push({
        amount: tokenContract.methods.getEthBalance(address),
        token: items[key].token,
      });
    } else {
      const tokenContract = new web3[items[key].network].eth.Contract(
        erc20Abi,
        items[key].tokenAddress
      );
      calls[items[key].network].push({
        amount: tokenContract.methods.balanceOf(address),
        token: items[key].token,
        address: items[key].tokenAddress,
      });

      calls[items[key].network].push({
        allowance: tokenContract.methods.allowance(address, items[key].earnContractAddress),
        token: items[key].token,
        spender: items[key].earnContractAddress,
      });

      const earnedTokenContract = new web3[items[key].network].eth.Contract(
        erc20Abi,
        items[key].earnedTokenAddress
      );
      calls[items[key].network].push({
        amount: earnedTokenContract.methods.balanceOf(address),
        token: items[key].earnedToken,
        address: items[key].tokenAddress,
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
    const item = response[index];

    if (!isEmpty(item.amount)) {
      tokens[item.token].balance = item.amount;
      tokens[item.token].address = item.address;
    }

    if (!isEmpty(item.allowance)) {
      tokens[item.token].allowance = { [item.spender]: parseInt(item.allowance) };
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

const getBoostBalances = async (items, state, dispatch) => {
  console.log('redux getBoostBalances() processing...');
  const address = state.walletReducer.address;
  const web3 = state.walletReducer.rpc;

  const multicall = [];
  const calls = [];

  for (let key in web3) {
    multicall[key] = new MultiCall(web3[key], config[key].multicallAddress);
    calls[key] = [];
  }

  for (let key in items) {
    const tokenContract = new web3[items[key].network].eth.Contract(
      erc20Abi,
      items[key].tokenAddress
    );
    const earnContract = new web3[items[key].network].eth.Contract(
      erc20Abi,
      items[key].earnContractAddress
    );

    calls[items[key].network].push({
      amount: tokenContract.methods.balanceOf(address),
      token: items[key].token,
      address: items[key].tokenAddress,
    });

    calls[items[key].network].push({
      amount: earnContract.methods.balanceOf(address),
      token: items[key].token + 'Boost',
      address: items[key].tokenAddress,
    });

    calls[items[key].network].push({
      allowance: tokenContract.methods.allowance(address, items[key].earnContractAddress),
      token: items[key].token,
      spender: items[key].earnContractAddress,
    });
  }

  let response = [];

  for (let key in multicall) {
    const resp = await multicall[key].all([calls[key]]);
    response = [...response, ...resp[0]];
  }

  const tokens = state.balanceReducer.tokens;

  for (let index in response) {
    const item = response[index];

    if (!isEmpty(item.amount)) {
      tokens[item.token].balance = item.amount;
      tokens[item.token].address = item.address;
    }

    if (!isEmpty(item.allowance)) {
      tokens[item.token].allowance = { [item.spender]: parseInt(item.allowance) };
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

const fetchBalances = (item = false) => {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.walletReducer.address) {
      const pools = state.vaultReducer.pools;
      dispatch({ type: BALANCE_FETCH_BALANCES_BEGIN });
      return await getBalances(item ? [item] : pools, state, dispatch);
    }
  };
};

const fetchBoostBalances = (item = false) => {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.walletReducer.address) {
      const boosts = state.vaultReducer.boosts;
      dispatch({ type: BALANCE_FETCH_BALANCES_BEGIN });
      return await getBoostBalances(item ? [item] : boosts, state, dispatch);
    }
  };
};

const obj = {
  fetchBalances,
  fetchBoostBalances,
};

export default obj;
