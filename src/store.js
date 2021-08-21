import { applyMiddleware, createStore } from 'redux';
import rootReducer from './features/redux/reducers';
import thunk from 'redux-thunk';

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
