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
    language: 'en',
    clients: initialClients(),
    rpc: false,
    web3modal: null,
    address: null,
    pending: false,
}

const walletReducer = (state = initialState, action) => {
    switch(action.type){
        case "WALLET_DISCONNECT":
            return {
                ...state,
                address: null,
            }
        case "WALLET_CONNECT_BEGIN":
            return {
                ...state,
                pending: true,
            }
        case "WALLET_CONNECT_DONE":
            return {
                ...state,
                pending: false,
                address: action.payload.address,
            }
        case "WALLET_CREATE_MODAL":
            return {
                ...state,
                web3modal: action.payload.data,
            }
        case "SET_NETWORK":
                return {
                    ...state,
                    network: action.payload.network,
                    clients: action.payload.clients,
                    rpc: false,
                }
        case "WALLET_RPC":
            return {
                ...state,
                rpc: action.payload.rpc,
            }
        default:
            return state
    }
}

export default walletReducer;
