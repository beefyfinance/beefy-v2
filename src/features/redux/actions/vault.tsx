import { MultiCall } from 'eth-multicall';
import {
  HOME_FETCH_BOOSTS_BEGIN,
  HOME_FETCH_BOOSTS_DONE,
  HOME_FETCH_POOLS_BEGIN,
  HOME_FETCH_POOLS_DONE,
  HOME_LINK_BOOSTS_DONE,
} from '../constants';
import BigNumber from 'bignumber.js';
import { config } from '../../../config/config';
import { isEmpty } from '../../../helpers/utils';
import { BIG_ZERO, byDecimals, convertAmountToRawNumber } from '../../../helpers/format';
import vaultAbi from '../../../config/abi/vault.json';
import boostAbi from '../../../config/abi/boost.json';
import zapAbi from '../../../config/abi/zap.json';
import uniswapV2PairABI from '../../../config/abi/uniswapV2Pair.json';
import uniswapV2RouterABI from '../../../config/abi/uniswapV2Router.json';

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
  } //for (let key in items)

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
			const S = pools[ item.id].excluded;
      if (S && pools[ S]) {
        tvl = tvl.minus( pools[ S].tvl);
      }
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
  } //for (let i = 0; i < response.length;

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
}; //const getPools = async

const getBoosts = async (items, state, dispatch) => {
  console.log('redux getBoosts() processing...');
  const web3 = state.walletReducer.rpc;
  const prices = state.pricesReducer.prices;
  const pools = state.vaultReducer.pools;
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
    const tokenContract = new web3[pool.network].eth.Contract(boostAbi, pool.earnContractAddress);
    calls[pool.network].push({
      id: pool.id,
      totalStaked: tokenContract.methods.totalSupply(),
      rewardRate: tokenContract.methods.rewardRate(),
      periodFinish: tokenContract.methods.periodFinish(),
    });

    if (pool.isMooStaked) {
      const mooContract = new web3[pool.network].eth.Contract(
        vaultAbi,
        pools[pool.poolId].earnContractAddress
      );
      moos[pool.network].push({
        id: pool.id,
        pricePerFullShare: mooContract.methods.getPricePerFullShare(),
      });
    }
  } //for (let key in items)

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

        if (!isEmpty(item.periodFinish)) {
          response[item.id]['periodFinish'] = item.periodFinish;
        }
      }); //result.value[0].forEach( item
    } //if (!isEmpty( result.value[0]))
  }); //results.forEach( result =>

  for (const key in response) {
    const item = response[key],
      boost = boosts[item.id];
    const tokenDecimals = new BigNumber(10).exponentiatedBy(boost.tokenDecimals);
    const earnedDecimals = new BigNumber(10).exponentiatedBy(boost.earnedTokenDecimals);
    const tokenPrice = boost.tokenOracleId in prices ? prices[boost.tokenOracleId] : 0;
    const earnPrice = boost.earnedOracleId in prices ? prices[boost.earnedOracleId] : 0;
    const totalStaked = boost.isMooStaked
      ? new BigNumber(item.totalStaked).times(item.pricePerFullShare).dividedBy(tokenDecimals)
      : new BigNumber(item.totalStaked);
    const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy(tokenDecimals);
    const yearlyRewardsInUsd = new BigNumber(item.rewardRate)
      .times(3600)
      .times(24)
      .times(365)
      .times(earnPrice)
      .dividedBy(earnedDecimals);

    boost.apr = Number(yearlyRewardsInUsd.dividedBy(totalStakedInUsd));
    boost.staked = totalStaked.dividedBy(tokenDecimals);
    boost.tvl = totalStakedInUsd.toFixed(2);
    boost.periodFinish = item.periodFinish;
  } //for (const key in response)

  dispatch({
    type: HOME_FETCH_BOOSTS_DONE,
    payload: {
      boosts: boosts,
      isBoostsLoading: true,
      lastUpdated: new Date().getTime(),
    },
  });

  return true;
}; //const getBoosts = async

const linkBoosts = async (pools, boosts, dispatch) => {
  console.log('redux linkBoosts() processing...');
  var ts = Date.now() / 1000;
  for (const key in boosts) {
    const boost = boosts[key];
    const isActive = parseInt(boost.periodFinish) > ts;

    const relevantVault = pools[boost.poolId];
    if (isActive) {
      relevantVault.isBoosted = true;
      relevantVault.boostData = boost;
    }
    relevantVault.boosts = [...relevantVault.boosts, boost];
  }

  dispatch({
    type: HOME_LINK_BOOSTS_DONE,
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

const linkVaultBoosts = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const pools = state.vaultReducer.pools;
    const boosts = state.vaultReducer.boosts;
    dispatch({ type: HOME_FETCH_BOOSTS_BEGIN });
    return await linkBoosts(pools, boosts, dispatch);
  };
};

const estimateZapDeposit = ({ web3, vault, formData, setFormData }) => {
  const tokenIn = formData.zap.tokens.find(t => t.symbol === formData.deposit.token);
  const tokenOut = formData.zap.tokens.find(t => t.symbol !== formData.deposit.token);

  const zapEstimate = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    amountIn: BIG_ZERO,
    amountOut: BIG_ZERO,
    isLoading: false,
  };

  if (formData.deposit.amount.isZero()) {
    return setFormData(prevFormData => {
      prevFormData.deposit.zapEstimate = zapEstimate;
      return { ...prevFormData };
    });
  }

  const zapAddress = formData.zap.address;
  const vaultAddress = vault.earnContractAddress;
  const tokenAmount = convertAmountToRawNumber(formData.deposit.amount, tokenIn.decimals);

  setFormData(prevFormData => {
    if (prevFormData.deposit.zapEstimate.isLoading) {
      return prevFormData;
    }
    prevFormData.deposit.zapEstimate.isLoading = true;
    return { ...prevFormData };
  });

  const contract = new web3[vault.network].eth.Contract(zapAbi, zapAddress);

  return contract.methods
    .estimateSwap(vaultAddress, tokenIn.address, tokenAmount)
    .call()
    .then(response => {
      setFormData(prevFormData => {
        if (formData.deposit.amount === prevFormData.deposit.amount) {
          prevFormData.deposit.zapEstimate = {
            ...zapEstimate,
            amountIn: byDecimals(response.swapAmountIn, tokenIn.decimals),
            amountOut: byDecimals(response.swapAmountOut, tokenOut.decimals),
          };
          return { ...prevFormData };
        }
        return prevFormData;
      });
    });
};

const estimateZapWithdraw = ({ web3, vault, formData, setFormData }) => {
  const tokenOut = formData.zap.tokens.find(t => t.symbol === formData.withdraw.token);
  const tokenIn = formData.zap.tokens.find(t => t.symbol !== formData.withdraw.token);

  const zapEstimate = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    amountIn: BIG_ZERO,
    amountOut: BIG_ZERO,
    isLoading: false,
  };

  if (formData.withdraw.amount.isZero()) {
    return setFormData(prevFormData => {
      prevFormData.withdraw.zapEstimate = zapEstimate;
      return { ...prevFormData };
    });
  }

  setFormData(prevFormData => {
    if (prevFormData.withdraw.zapEstimate.isLoading) {
      return prevFormData;
    }
    prevFormData.withdraw.zapEstimate.isLoading = true;
    return { ...prevFormData };
  });

  const multicall = new MultiCall(web3[vault.network], config[vault.network].multicallAddress);
  const pairContract = new web3[vault.network].eth.Contract(uniswapV2PairABI, vault.tokenAddress);

  const multicallPromise = multicall
    .all([
      [
        {
          totalSupply: pairContract.methods.totalSupply(),
          decimals: pairContract.methods.decimals(),
          token0: pairContract.methods.token0(),
          token1: pairContract.methods.token1(),
          reserves: pairContract.methods.getReserves(),
        },
      ],
    ])
    .then(([[pair]]) => {
      const reserveIn = tokenIn.address === pair.token0 ? pair.reserves[0] : pair.reserves[1];
      const reserveOut = tokenOut.address === pair.token1 ? pair.reserves[1] : pair.reserves[0];

      const tokenAmount = formData.withdraw.amount.times(
        new BigNumber('10').pow(vault.tokenDecimals)
      );
      const equity = tokenAmount.dividedBy(pair.totalSupply);
      const amountIn = equity
        .multipliedBy(reserveIn)
        .decimalPlaces(0, BigNumber.ROUND_DOWN)
        .toString(10);

      const routerContract = new web3[vault.network].eth.Contract(
        uniswapV2RouterABI,
        formData.zap.router
      );

      return routerContract.methods
        .getAmountOut(amountIn, reserveIn, reserveOut)
        .call()
        .then(amountOut => {
          setFormData(prevFormData => {
            if (formData.withdraw.amount === prevFormData.withdraw.amount) {
              prevFormData.withdraw.zapEstimate = {
                ...zapEstimate,
                amountIn: byDecimals(amountIn, tokenIn.decimals),
                amountOut: byDecimals(amountOut, tokenOut.decimals),
              };
              return { ...prevFormData };
            }
            return prevFormData;
          });
        });
    });

  return multicallPromise;
};

export const vault = {
  fetchPools,
  fetchBoosts,
  linkVaultBoosts,
  estimateZapDeposit,
  estimateZapWithdraw,
};
