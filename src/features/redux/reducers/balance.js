import {
    BALANCE_FETCH_BALANCES_BEGIN,
    BALANCE_FETCH_BALANCES_DONE,
    BALANCE_FETCH_DEPOSITED_BEGIN,
    BALANCE_FETCH_DEPOSITED_DONE
} from "../constants";

const initialState = {
    deposited: [],
    balances: [],
    lastUpdated: 0,
    isDepositedLoading: false,
    isBalancesLoading: true,
    isDepositedFirstTime: true,
    isBalancesFirstTime: true,
}

const balanceReducer = (state = initialState, action) => {
    switch(action.type){
        case BALANCE_FETCH_DEPOSITED_BEGIN:
            return {
                ...state,
                isDepositedLoading: state.isDepositedFirstTime,
            }
        case BALANCE_FETCH_DEPOSITED_DONE:
            return {
                ...state,
                deposited: action.payload.deposited,
                lastUpdated: action.payload.lastUpdated,
                isDepositedLoading: false,
                isDepositedFirstTime: false,
            }
        case BALANCE_FETCH_BALANCES_BEGIN:
            return {
                ...state,
                isBalancesLoading: state.isBalancesFirstTime,
            }
        case BALANCE_FETCH_BALANCES_DONE:
            return {
                ...state,
                balances: action.payload.balances,
                lastUpdated: action.payload.lastUpdated,
                isBalancesLoading: false,
                isBalancesFirstTime: false,
            }
        default:
            return state
    }
}

export default balanceReducer;
