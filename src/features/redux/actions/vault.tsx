import { MultiCall } from 'eth-multicall';
import {
  HOME_FETCH_BOOSTS_BEGIN,
  HOME_FETCH_BOOSTS_DONE,
  HOME_FETCH_POOLS_BEGIN,
  HOME_FETCH_POOLS_DONE,
} from '../constants';
import BigNumber from 'bignumber.js';
import { config } from '../../../config/config';
import { isEmpty } from '../../../helpers/utils';

const vaultAbi = require('../../../config/abi/vault.json');

const getPools = async (items, state, dispatch) => {
  console.log('redux getPools() processing...');
  const web3 = state.walletReducer.rpc;
  const pools = { ...state.vaultReducer.pools };
  const prices = state.pricesReducer.prices;
  const apy = state.pricesReducer.apy;

  if (isEmpty(prices)) {
    console.log('empty prices :D');
    return false;
  }

  const multicall = [];
  const calls = [];

  for (let key in web3) {
    multicall[key] = new MultiCall(web3[key], config[key].multicallAddress);
    calls[key] = [];
  }

  for (let key in items) {
    const pool = items[key];
    if (pool.isGovVault) {
      const tokenContract = new web3[pool.network].eth.Contract(vaultAbi, pool.poolAddress);
      let reqs = {
        id: pool.id,
        totalStaked: tokenContract.methods.totalSupply(),
      };
      calls[pool.network].push(reqs);
    } else {
      const tokenContract = new web3[pool.network].eth.Contract(vaultAbi, pool.earnedTokenAddress);
      calls[pool.network].push({
        id: pool.id,
        balance: tokenContract.methods.balance(),
        pricePerFullShare: tokenContract.methods.getPricePerFullShare(),
        strategy: tokenContract.methods.strategy(),
      });
    }
  }

  const promises = [];
  for (const key in multicall) {
    promises.push(multicall[key].all([calls[key]]));
  }
  const results = await Promise.allSettled(promises);

  let response = [];
  results.forEach(result => {
    if (result.status !== 'fulfilled') {
      console.warn('getPoolsAll error', result.reason);
      // FIXME: queue chain retry?
      return;
    }
    response = [...response, ...result.value[0]];
  });

  let totalTvl = new BigNumber(0);
  for (let i = 0; i < response.length; i++) {
    const item = response[i];

    let tvl;

    if (pools[item.id].isGovVault) {
      const totalStaked = new BigNumber(item.totalStaked);
      const price = pools[item.id].oracleId in prices ? prices[pools[item.id].oracleId] : 0;
      tvl = totalStaked
        .times(price)
        .dividedBy(new BigNumber(10).exponentiatedBy(pools[item.id].tokenDecimals));
      tvl = tvl.minus(pools[pools[item.id].excluded].tvl);
    } else {
      const balance = new BigNumber(item.balance);
      const price = pools[item.id].oracleId in prices ? prices[pools[item.id].oracleId] : 0;
      tvl = balance
        .times(price)
        .dividedBy(new BigNumber(10).exponentiatedBy(pools[item.id].tokenDecimals));
      pools[item.id].pricePerFullShare = item.pricePerFullShare;
      pools[item.id].strategy = item.strategy;
    }

    pools[item.id].tvl = tvl;
    pools[item.id].apy = !isEmpty(apy) && item.id in apy ? apy[item.id] : 0;
    totalTvl = totalTvl.plus(tvl);
  }

  dispatch({
    type: HOME_FETCH_POOLS_DONE,
    payload: {
      pools: pools,
      totalTvl: totalTvl,
      isPoolsLoading: false,
      lastUpdated: new Date().getTime(),
    },
  });

  return true;
};

const getBoosts = async (items, state, dispatch) => {
  console.log('redux getBoosts() processing...');
  const web3 = state.walletReducer.rpc;
  const prices = state.pricesReducer.prices;
  const boosts = { ...state.vaultReducer.boosts };

  const multicall = [];
  const calls = [];
  const moos = [];

  for (let key in web3) {
    multicall[key] = new MultiCall(web3[key], config[key].multicallAddress);
    calls[key] = [];
    moos[key] = [];
  }

  for (let key in items) {
    const pool = items[key];
    const tokenContract = new web3[pool.network].eth.Contract(vaultAbi, pool.earnContractAddress);
    calls[pool.network].push({
      id: pool.id,
      totalStaked: tokenContract.methods.totalSupply(),
      rewardRate: tokenContract.methods.rewardRate(),
    });

    if (pool.isMooStaked) {
      const mooContract = new web3[pool.network].eth.Contract(vaultAbi, pool.tokenAddress);
      moos[pool.network].push({
        id: pool.id,
        pricePerFullShare: mooContract.methods.getPricePerFullShare(),
      });
    }
  }

  const promises = [];
  for (const key in multicall) {
    promises.push(multicall[key].all([calls[key]]));
    promises.push(multicall[key].all([moos[key]]));
  }
  const results = await Promise.allSettled(promises);
  const response = [];

  results.forEach(result => {
    if (result.status !== 'fulfilled') {
      console.warn('getPoolsAll error', result.reason);
      // FIXME: queue chain retry?
      return;
    }

    if (!isEmpty(result.value[0])) {
      result.value[0].forEach(item => {
        if (isEmpty(response[item.id])) {
          response[item.id] = { id: item.id };
        }

        if (!isEmpty(item.totalStaked)) {
          response[item.id]['totalStaked'] = item.totalStaked;
        }

        if (!isEmpty(item.rewardRate)) {
          response[item.id]['rewardRate'] = item.rewardRate;
        }

        if (!isEmpty(item.pricePerFullShare)) {
          response[item.id]['pricePerFullShare'] = item.pricePerFullShare;
        }
      });
    }
  });

  for (const key in response) {
    const item = response[key];
    const tokenDecimals = new BigNumber(10).exponentiatedBy(boosts[item.id].tokenDecimals);
    const tokenPrice =
      boosts[item.id].tokenOracleId in prices ? prices[boosts[item.id].tokenOracleId] : 0;
    const earnPrice =
      boosts[item.id].earnedOracleId in prices ? prices[boosts[item.id].earnedOracleId] : 0;
    const totalStaked = boosts[item.id].isMooStaked
      ? new BigNumber(item.totalStaked).times(item.pricePerFullShare).dividedBy(tokenDecimals)
      : new BigNumber(item.totalStaked);
    const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy(tokenDecimals);
    const yearlyRewardsInUsd = new BigNumber(item.rewardRate)
      .times(3600)
      .times(24)
      .times(365)
      .times(earnPrice)
      .dividedBy(tokenDecimals);

    boosts[item.id].apr = Number(yearlyRewardsInUsd.dividedBy(totalStakedInUsd));
    boosts[item.id].staked = totalStaked.dividedBy(tokenDecimals);
    boosts[item.id].tvl = totalStakedInUsd.toFixed(2);
  }

  dispatch({
    type: HOME_FETCH_BOOSTS_DONE,
    payload: {
      boosts: boosts,
      isBoostsLoading: false,
      lastUpdated: new Date().getTime(),
    },
  });

  return true;
};

const fetchPools = (item = false) => {
  return async (dispatch, getState) => {
    const state = getState();
    const pools = state.vaultReducer.pools;
    dispatch({ type: HOME_FETCH_POOLS_BEGIN });
    return await getPools(item ? [item] : pools, state, dispatch);
  };
};

const fetchBoosts = (item = false) => {
  return async (dispatch, getState) => {
    const state = getState();
    const boosts = state.vaultReducer.boosts;
    dispatch({ type: HOME_FETCH_BOOSTS_BEGIN });
    return await getBoosts(item ? [item] : boosts, state, dispatch);
  };
};

export const vault = {
  fetchPools,
  fetchBoosts,
};
