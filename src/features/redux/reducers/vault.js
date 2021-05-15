import {
    HOME_FETCH_PLATFORMS,
    HOME_FETCH_POOLS_BEGIN,
    HOME_FETCH_POOLS_SUCCESS,
    HOME_FETCH_POOLS_SUCCESS_WDATA
} from "../constants";

const initialState = {
    pools: {},
    totalTvl: 0,
    isPoolsLoading: false,
    isDataLoading: false,
    lastUpdated: 0,
    platforms: {},
}

const vaultReducer = (state = initialState, action) => {
    switch(action.type){
        case HOME_FETCH_POOLS_BEGIN:
            return {
                ...state,
                isPoolsLoading: true,
            }
        case HOME_FETCH_POOLS_SUCCESS:
            return {
                ...state,
                pools: action.payload.pools,
                lastUpdated: action.payload.lastUpdated,
                isDataLoading: action.payload.isDataLoading,
                isPoolsLoading: action.payload.isPoolsLoading,
            }
        case HOME_FETCH_POOLS_SUCCESS_WDATA:
            return {
                ...state,
                pools: action.payload.pools,
                totalTvl: action.payload.totalTvl,
                lastUpdated: action.payload.lastUpdated,
                isDataLoading: action.payload.isDataLoading,
                isPoolsLoading: action.payload.isPoolsLoading,
            }
        case HOME_FETCH_PLATFORMS:
            return {
                ...state,
                platforms: action.payload.platforms,
            }
        default:
            return state
    }
}

export default vaultReducer;
