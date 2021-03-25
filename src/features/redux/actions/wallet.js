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
        const connect = async () => {
            console.log('redux fetchRpc called. (' + state.walletReducer.network + ')');
            const web3 = await new Web3(clients[~~(clients.length * Math.random())]);

            try {
                await web3.eth.net.isListening();
                return dispatch({
                    type: WALLET_RPC_SUCCESS,
                    payload: {rpc: web3}
                });
            } catch(err) {
                console.log('redux fetchRpc failed, retrying... (' + state.walletReducer.network + ')');
                setTimeout(async () => {
                    return await connect();
                }, 1000);
            }
        }

        return connect();
    };
}

const obj = {
    setNetwork,
    fetchRpc,
}

export default obj
