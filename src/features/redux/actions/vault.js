import {MultiCall} from 'eth-multicall';
import {
    HOME_FETCH_PLATFORMS,
    HOME_FETCH_POOLS_BEGIN,
    HOME_FETCH_POOLS_SUCCESS,
    HOME_FETCH_POOLS_SUCCESS_WDATA
} from "../constants";
import BigNumber from "bignumber.js";
import {config} from '../../../config/config';
import {isEmpty} from "../../../helpers/utils";

const vaultAbi = require('../../../config/abi/vault.json');

const getPoolsForNetwork = async (state) => {

    let promise = []
    let pools = []
    let networks = []

    if(Object.keys(state.vaultReducer.pools).length > 0) {
        return state.vaultReducer.pools;
    }

    for(let net in config) {
        networks.push(net);
        promise.push(await import('../../../config/vault/' + net));
    }

    const data = await Promise.all(promise);
    const platforms = [];

    data.forEach((arr, key) => {
        arr.pools.forEach((pool) => {
            pool['network'] = networks[key];
            pool['deposited'] = 0;
            pool['balance'] = 0;
            pool['daily'] = 0;
            pool['apy'] = 0;
            pool['tvl'] = 0;
            pool['lastUpdated'] = 0;

            if(!isEmpty(pool.platform)) {
                if(!platforms.includes(pool.platform)) {
                    platforms[(pool.platform).toLowerCase()] = pool.platform;
                }
            }

            pools.push(pool);
        });
    });

    return {pools, platforms};
}

const getPoolData = async (state, dispatch) => {
    const web3 = state.walletReducer.rpc;
    const pools = state.vaultReducer.pools;
    const prices = state.pricesReducer.prices;
    const apy = state.pricesReducer.apy;
    const isDataLoading = state.vaultReducer.isDataLoading;

    if(Object.keys(prices).length === 0 || isDataLoading) {
        return false;
    }

    console.log('redux getPoolData() processing...');

    const multicall = [];
    const calls = [];

    for(let key in web3) {
        multicall[key] = new MultiCall(web3[key], config[key].multicallAddress);
        calls[key] = [];
    }

    for (let key in pools) {
        const tokenContract = new web3[pools[key].network].eth.Contract(vaultAbi, pools[key].earnedTokenAddress);
        calls[pools[key].network].push({id: pools[key].id, balance: tokenContract.methods.balance()});
    }

    let response = [];
    let totalTvl = 0;

    for(let key in multicall) {
        const resp = await multicall[key].all([calls[key]]);
        response = [...response, ...resp[0]]
    }

    for (let key in pools) {
        for(let index in response) {
            if(pools[key].id === response[index].id) {
                const balance = new BigNumber(response[index].balance);
                const price = (pools[key].oracleId in prices) ? prices[pools[key].oracleId] : 0;
                pools[key].tvl = balance.times(price).dividedBy(new BigNumber(10).exponentiatedBy(pools[key].tokenDecimals));
                pools[key].apy = (apy !== undefined && pools[key].id in apy) ? apy[pools[key].id] : 0;
                totalTvl = new BigNumber(totalTvl).plus(pools[key].tvl);
                break;
            }
        }
    }

    dispatch({
        type: HOME_FETCH_POOLS_SUCCESS_WDATA,
        payload: {
            pools: pools,
            totalTvl: totalTvl,
            isPoolsLoading: false,
            isDataLoading: false,
            lastUpdated: new Date().getTime()
        }
    });

    return true;
}

const fetchPools = (isPoolsLoading = true) => {
    console.log('redux fetchPools() called.');
    return async (dispatch, getState) => {
        dispatch({
            type: HOME_FETCH_POOLS_BEGIN,
        });

        const state = getState();
        let {pools, platforms} = await getPoolsForNetwork(state);

        dispatch({type: HOME_FETCH_PLATFORMS, payload: {platforms: platforms}})

        dispatch({
            type: HOME_FETCH_POOLS_SUCCESS,
            payload: {pools: pools, isPoolsLoading: isPoolsLoading, isDataLoading: false}
        });
    };
}

const fetchPoolsData = () => {
    return async (dispatch, getState) => {
        const fetch = async () => {
            console.log('redux getPoolData() called.');
            const state = getState();
            return state.walletReducer.rpc['bsc'] ? await getPoolData(state, dispatch) : false;
        }

        const start = async () => {
            const state = getState();
            const done = await fetch();
            console.log('done', done, Object.keys(state.pricesReducer.prices).length);

            if(!done) {
                setTimeout(async () => {
                    await start();
                }, 1000);
            }
        }

        return await start();
    };
}

const obj = {
    fetchPools,
    fetchPoolsData,
}

export default obj
