import {config} from '../../../config/config';

const initialNetwork = () => {
    const storage = localStorage.getItem('network');
    return storage === null ? 'bsc' : storage;
}

const initialRpc = () => {
    const rpcs = []

    for(let key in config) {
        rpcs[key] = null
    }

    return rpcs;
}

const initialState = {
    network: initialNetwork(),
    language: 'en',
    rpc: initialRpc(),
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
                rpc: action.payload.rpcs,
            }
        default:
            return state
    }
}

export default walletReducer;
