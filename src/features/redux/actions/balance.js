import {MultiCall} from 'eth-multicall';
import {
    BALANCE_FETCH_BALANCES_BEGIN,
    BALANCE_FETCH_BALANCES_DONE,
    BALANCE_FETCH_DEPOSITED_BEGIN,
    BALANCE_FETCH_DEPOSITED_DONE,
} from "../constants";
import BigNumber from "bignumber.js";
import {config} from '../../../config/config';
import {byDecimals} from "../../../helpers/format";
import {isEmpty} from "../../../helpers/utils";

const vaultAbi = require('../../../config/abi/vault.json');
const erc20Abi = require('../../../config/abi/erc20.json');
const multicallAbi = require('../../../config/abi/multicall.json');

const getDepositedSingle = async (item, state, dispatch) => {
    console.log('redux getDepositedSingle() processing...');
    const address = state.walletReducer.address;
    const web3 = state.walletReducer.rpc;
    const multicall = new MultiCall(web3[item.network], config[item.network].multicallAddress);
    const calls = [];

    const tokenContract = new web3[item.network].eth.Contract(vaultAbi, item.earnedTokenAddress);
    calls.push({
        id: item.id,
        deposited: tokenContract.methods.balanceOf(address),
        pricePerShare: tokenContract.methods.getPricePerFullShare(),
    });

    const deposited = state.balanceReducer.deposited;
    const response = await multicall.all([calls]);

    const amount = response[0][0].deposited;
    const pricePerShare = response[0][0].pricePerShare;
    const total = byDecimals(new BigNumber(amount).multipliedBy(byDecimals(pricePerShare)), item.tokenDecimals).toFixed(8);
    deposited[response[0][0].id] = {amount: amount, pricePerShare: pricePerShare, total: total};

    dispatch({
        type: BALANCE_FETCH_DEPOSITED_DONE,
        payload: {
            deposited: deposited,
            lastUpdated: new Date().getTime()
        }
    });

    return true;
}

const getDepositedAll = async (state, dispatch) => {
    console.log('redux getDepositedAll() processing...');
    const address = state.walletReducer.address;
    const web3 = state.walletReducer.rpc;
    const pools = state.vaultReducer.pools;

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
            deposited: tokenContract.methods.balanceOf(address),
            pricePerShare: tokenContract.methods.getPricePerFullShare(),
        });
    }

    let response = [];

    for(let key in multicall) {
        let resp = await multicall[key].all([calls[key]]);
        response = [...response, ...resp[0]];
    }

    const deposited = {}

    for (let key in pools) {
        for(let index in response) {
            if(pools[key].id === response[index].id) {
                const amount = response[index].deposited;
                const pricePerShare = response[index].pricePerShare;
                const total = byDecimals(new BigNumber(amount).multipliedBy(byDecimals(pricePerShare)), pools[key].tokenDecimals).toFixed(8);
                deposited[response[index].id] = {amount: amount, pricePerShare: pricePerShare, total: total};
                break;
            }
        }
    }

    dispatch({
        type: BALANCE_FETCH_DEPOSITED_DONE,
        payload: {
            deposited: deposited,
            lastUpdated: new Date().getTime()
        }
    });

    return true;
}

const getBalancesSingle = async (item, state, dispatch) => {
    console.log('redux getBalancesSingle() processing...');
    const address = state.walletReducer.address;
    const web3 = state.walletReducer.rpc;
    const multicall = new MultiCall(web3[item.network], config[item.network].multicallAddress);
    const calls = [];


    if(isEmpty(item.tokenAddress)) {
        const tokenContract = new web3[item.network].eth.Contract(multicallAbi, multicall[item.network].contract);
        calls.push({
            info: JSON.stringify({token: item.token, decimals: item.tokenDecimals}),
            amount: tokenContract.methods.getEthBalance(address),
        });
    } else {
        const tokenContract = new web3[item.network].eth.Contract(erc20Abi, item.tokenAddress);
        calls.push({
            info: JSON.stringify({token: item.token, decimals: item.tokenDecimals}),
            amount: tokenContract.methods.balanceOf(address),
        });
    }

    const balances = state.balanceReducer.balances;
    const response = await multicall.all([calls]);

    const amount = response[0][0].amount;
    const data = JSON.parse(response[0][0].info);
    const total = byDecimals(new BigNumber(amount), data.decimals).toFixed(8);
    balances[data.token] = {amount: amount, total: total};

    dispatch({
        type: BALANCE_FETCH_BALANCES_DONE,
        payload: {
            balances: balances,
            lastUpdated: new Date().getTime()
        }
    });

    return true;
}

const getBalancesAll = async (state, dispatch) => {
    console.log('redux getBalancesAll() processing...');
    dispatch({type: BALANCE_FETCH_BALANCES_BEGIN});

    const address = state.walletReducer.address;
    const web3 = state.walletReducer.rpc;
    const pools = state.vaultReducer.pools;

    const multicall = [];
    const calls = [];

    for(let key in web3) {
        multicall[key] = new MultiCall(web3[key], config[key].multicallAddress);
        calls[key] = [];
    }

    for (let key in pools) {
        if(isEmpty(pools[key].tokenAddress)) {
            const tokenContract = new web3[pools[key].network].eth.Contract(multicallAbi, multicall[pools[key].network].contract);
            calls[pools[key].network].push({
                info: JSON.stringify({token: pools[key].token, decimals: pools[key].tokenDecimals}),
                amount: tokenContract.methods.getEthBalance(address),
            });
        } else {
            const tokenContract = new web3[pools[key].network].eth.Contract(erc20Abi, pools[key].tokenAddress);
            calls[pools[key].network].push({
                info: JSON.stringify({token: pools[key].token, decimals: pools[key].tokenDecimals}),
                amount: tokenContract.methods.balanceOf(address),
            });
        }
    }

    let response = [];

    for(let key in multicall) {
        let resp = await multicall[key].all([calls[key]]);
        response = [...response, ...resp[0]];
    }

    const balances = {}

    for(let index in response) {
        const amount = response[index].amount;
        const data = JSON.parse(response[index].info);
        const total = byDecimals(new BigNumber(amount), data.decimals).toFixed(8);
        balances[data.token] = {amount: amount, total: total};
    }

    dispatch({
        type: BALANCE_FETCH_BALANCES_DONE,
        payload: {
            balances: balances,
            lastUpdated: new Date().getTime()
        }
    });

    return true;
}

const fetchDeposited = (item = false) => {
    return async (dispatch, getState) => {
        const state = getState();
        if(state.walletReducer.address) {
            dispatch({type: BALANCE_FETCH_DEPOSITED_BEGIN});
            return item ? await getDepositedSingle(item, state, dispatch) : await getDepositedAll(state, dispatch);
        }
    };
}

const fetchBalances = (item = false) => {
    return async (dispatch, getState) => {
        const state = getState();
        if(state.walletReducer.address) {
            return item ? await getBalancesSingle(item, state, dispatch) : await getBalancesAll(state, dispatch);
        }
    };
}

const obj = {
    fetchDeposited,
    fetchBalances,
}

export default obj
