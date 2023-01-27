import _ from 'lodash';
import {
  updateURL,
  getURLWithParams,
  filtersToUrl,
  urlToFilters,
  getURLParams,
} from '../../../helpers/urlSync';
import { BeefyStore } from '../../../redux-types';

/**
 * This is the Redux middleware to handle changes from Redux Vaults Filters to
 * URL display
 * @param store
 */
export function urlUpdateActionsMiddleware(store: BeefyStore) {
  return next => async (action: { type: string; payload: any }) => {
    if(_.isEmpty(store.getState().entities.chains.byId)) return next(action)
    // Since inside this middleware we can dispatch actions in redux with this type
    // If one action of that type reaches this middleware, we should bypass this middleware
    // Because if not, we will enter in an endless loop
    if(action.type === "persist/PERSIST" ||
    action.type === "persist/REHYDRATE" ||
    action.type === "platforms/fetchPlatforms/fulfilled") return next(action);
    if (action.type.includes('filtered-vaults') === false) return next(action);

    // There is one special action: the reset one. If we got that one, we just reset the URL
    // We don't need to do anything else
    if (action.type === 'filtered-vaults/reset') { 
      updateURL(getURLWithParams());
      return next(action);
    }

    const _nextState = next(action)
    
    const newURL = filtersToUrl({
      filterState: store.getState().ui.filteredVaults,
      // Note: store.getState().entities.chains.byId is not available on first load BUT
      // since the middleware is triggered again on state changes, once the var is available it will
      // trigger a state change, and that will trigger this middleware, rendering it right
      // and since the difference in time between those two states is minimal (a few milliseconds)
      // it won't affect to the user
      chainsById: store.getState().entities.chains.byId,
      urlParams: getURLParams(),
    });
    updateURL(newURL);
    return _nextState;
  };
}

/**
 * This is the Redux middleware to handle changes from the URL to Redux Vault
 * Filters
 * @param store
 */
export function vaultsFilteringActionsMiddleware(store: BeefyStore) {
  return next => async (action: { type: string; payload: any }) => {
    // We want to trigger this middleware actions only in three cases:
    // - When loading the page (PERSIST and REHYDRATE events)
    // - When the chains info is loaded
    // In any other case, we just go next
    console.log(action.type)
    if(action.type !== "persist/PERSIST" && 
    action.type !== "persist/REHYDRATE" &&
    action.type !== "platforms/fetchPlatforms/fulfilled") return next(action);

    urlToFilters({
      url: getURLParams(),
      dispatcher: store.dispatch,
      // Note: store.getState().entities.chains.byId is not available on first load BUT
      // since the middleware is triggered again on state changes, once the var is available it will
      // trigger a state change, and that will trigger this middleware, rendering it right
      // and since the difference in time between those two states is minimal (a few milliseconds)
      // it won't affect to the user
      chainsById: store.getState().entities.chains.byId,
    });

    return next(action);
  };
}
