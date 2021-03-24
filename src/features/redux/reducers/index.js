import walletReducer from './wallet'
import vaultReducer from './vault'
import pricesReducer from './prices'
import {combineReducers} from 'redux'

const rootReducer = combineReducers({
    walletReducer,
    vaultReducer,
    pricesReducer,
})

export default rootReducer
