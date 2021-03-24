import {config} from '../../../config/config';

const initialNetwork = () => {
    const storage = localStorage.getItem('network');
    return storage === null ? 'bsc' : storage;
}

const initialClients = () => {
    const net = initialNetwork();

    if(config[net].rpc.length) {
        console.log('no public rpc available, throw error.');
    }

    return config[net].rpc;
}

const initialState = {
    network: initialNetwork(),
    clients: initialClients(),
    rpc: false,
    wallet: false,
}

const walletReducer = (state = initialState, action) => {
    switch(action.type){
        case "SET_NETWORK":
                return {
                    ...state,
                    network: action.payload.network,
                    clients: action.payload.clients,
                    rpc: false,
                }
        case "WALLET_RPC_SUCCESS":
            return {
                ...state,
                rpc: action.payload.rpc,
            }
        default:
            return state
    }
}

export default walletReducer;
