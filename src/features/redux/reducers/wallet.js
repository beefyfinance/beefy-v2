const initialNetwork = () => {
    const storage = localStorage.getItem('network');
    return storage === null ? 'bsc' : storage;
}

const initialState = {
    network: initialNetwork(),
    pools: {},
    poolsFormatted: {},
}

const wallet = (state = initialState, action) => {
    switch(action.type){
        case "SET_NETWORK":
                return {
                    ...state,
                    network: action.payload.network,
                    pools: action.payload.pools,
                    poolsFormatted: action.payload.poolsFormatted,
                }

        default:
            return state
    }
}

export default wallet;