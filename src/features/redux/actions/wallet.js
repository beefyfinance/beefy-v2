import {config} from '../../../config/config';
import {WALLET_RPC_SUCCESS} from "../constants";
const Web3 = require('web3');

const getClientsForNetwork = async (net) => {
    return config[net].rpc;
}

const setNetwork = (net) => {
    console.log('redux setNetwork called.')

    return async (dispatch, getState) => {
        const clients = await getClientsForNetwork(net);
        localStorage.setItem('network', net);

        dispatch({
            type: "SET_NETWORK",
            payload: {network: net, clients: clients}
        });
    };
}

const fetchRpc = () => {
    return async (dispatch, getState) => {

        const state = getState();
        const clients = await getClientsForNetwork(state.walletReducer.network);
        // todo: create func and check if connected, if not retry 5 times or show error.
        const connection = await new Web3(clients[~~(clients.length * Math.random())]);

        console.log('redux fetchRpc called. (' + state.walletReducer.network + ')');

        dispatch({
            type: WALLET_RPC_SUCCESS,
            payload: {rpc: connection}
        });
    };
}

const obj = {
    setNetwork,
    fetchRpc,
}

export default obj
