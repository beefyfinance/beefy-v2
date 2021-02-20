const initialState = {
    network: 'bsc',
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