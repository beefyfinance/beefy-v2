const initialState = {
    prices: [],
    apy: [],
    lastUpdated: 0,
}

const pricesReducer = (state = initialState, action) => {
    switch(action.type){
        case "FETCH_PRICES":
            return {
                ...state,
                prices: action.payload.prices,
                apy: action.payload.apy,
                lastUpdated: action.payload.lastUpdated,
            }
        default:
            return state
    }
}

export default pricesReducer;