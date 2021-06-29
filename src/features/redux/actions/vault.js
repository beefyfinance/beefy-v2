import {MultiCall} from 'eth-multicall';
import {HOME_FETCH_POOLS_BEGIN, HOME_FETCH_POOLS_DONE} from "../constants";
import BigNumber from "bignumber.js";
import {config} from '../../../config/config';
import {isEmpty} from "../../../helpers/utils";

const vaultAbi = require('../../../config/abi/vault.json');

const getPoolsSingle = async (item, state, dispatch) => {
    console.log('redux getPoolsSingle() processing...');
    const web3 = state.walletReducer.rpc;
    const pools = state.vaultReducer.pools;
    const prices = state.pricesReducer.prices;
    const apy = state.pricesReducer.apy;

    const multicall = new MultiCall(web3[item.network], config[item.network].multicallAddress);
    const calls = [];

    const tokenContract = new web3[item.network].eth.Contract(vaultAbi, item.earnedTokenAddress);
    calls.push({
        id: item.id,
        balance: tokenContract.methods.balance(),
        pricePerShare: tokenContract.methods.getPricePerFullShare(),
        strategy: tokenContract.methods.strategy()
    });

    const response = await multicall.all([calls]);

    for(let index in response[0]) {
        const item = response[0][index];
        const balance = new BigNumber(item.balance);
        const price = (pools[item.id].oracleId in prices) ? prices[pools[item.id].oracleId] : 0;

        pools[item.id].tvl = balance.times(price).dividedBy(new BigNumber(10).exponentiatedBy(pools[item.id].tokenDecimals));
        pools[item.id].apy = (!isEmpty(apy) && item.id in apy) ? apy[item.id] : 0;
        pools[item.id].pricePerShare = item.pricePerShare;
        pools[item.id].strategy = item.strategy;
    }

    dispatch({
        type: HOME_FETCH_POOLS_DONE,
        payload: {
            pools: pools,
            totalTvl: state.vaultReducer.totalTvl,
            isPoolsLoading: false,
            lastUpdated: new Date().getTime()
        }
    });

    return true;
}

const getPoolsAll = async (state, dispatch) => {
    console.log('redux getPoolsAll() processing...');
    const web3 = state.walletReducer.rpc;
    const pools = state.vaultReducer.pools;
    const prices = state.pricesReducer.prices;
    const apy = state.pricesReducer.apy;

    if(isEmpty(prices)) {
        console.log('empty prices :D')
        return false;
    }

    const multicall = [];
    const calls = [];

    for(let key in web3) {
        multicall[key] = new MultiCall(web3[key], config[key].multicallAddress);
        calls[key] = [];
    }

    for (let key in pools) {
        const tokenContract = new web3[pools[key].network].eth.Contract(vaultAbi, pools[key].earnedTokenAddress);
        calls[pools[key].network].push({
            id: pools[key].id,
            balance: tokenContract.methods.balance(),
            pricePerShare: tokenContract.methods.getPricePerFullShare(),
            strategy: tokenContract.methods.strategy(),
        });
    }

    let response = [];
    let totalTvl = 0;

    for(let key in multicall) {
        const resp = await multicall[key].all([calls[key]]);
        response = [...response, ...resp[0]];
    }

    for(let index in response) {
        const item = response[index];
        const balance = new BigNumber(item.balance);
        const price = (pools[item.id].oracleId in prices) ? prices[pools[item.id].oracleId] : 0;
        const tvl = balance.times(price).dividedBy(new BigNumber(10).exponentiatedBy(pools[item.id].tokenDecimals));

        pools[item.id].tvl = tvl;
        pools[item.id].apy = (!isEmpty(apy) && item.id in apy) ? apy[item.id] : 0;
        pools[item.id].pricePerShare = item.pricePerShare;
        pools[item.id].strategy = item.strategy;
        totalTvl = new BigNumber(totalTvl).plus(tvl);
    }

    dispatch({
        type: HOME_FETCH_POOLS_DONE,
        payload: {
            pools: pools,
            totalTvl: totalTvl,
            isPoolsLoading: false,
            lastUpdated: new Date().getTime()
        }
    });

    return true;
}

const fetchPools = (item = false) => {
    return async (dispatch, getState) => {
        const state = getState();
        dispatch({type: HOME_FETCH_POOLS_BEGIN});
        return item ? await getPoolsSingle(item, state, dispatch) : await getPoolsAll(state, dispatch);
    };
}

const obj = {
    fetchPools,
}

export default obj
