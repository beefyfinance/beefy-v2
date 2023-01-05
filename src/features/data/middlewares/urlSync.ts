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
    // Since inside this middleware we can dispatch actions in redux with this type
    // If one action of that type reaches this middleware, we should bypass this middleware
    // Because if not, we will enter in an endless loop
    if (action.type.includes('filtered-vaults') === false) return next(action);

    // There is one special action: the reset one. If we got that one, we just reset the URL
    // We don't need to do anything else
    if (action.type === 'filtered-vaults/reset') {
      next(action);
      updateURL(getURLWithParams());
      return;
    }

    next(action);

    const newURL = filtersToUrl({
      filterState: store.getState().ui.filteredVaults,
      chainsById: store.getState().entities.chains.byId,
    });
    updateURL(newURL);
  };
}

/**
 * This is the Redux middleware to handle changes from the URL to Redux Vault
 * Filters
 * @param store
 */
export function vaultsFilteringActionsMiddleware(store: BeefyStore) {
  return next => async (action: { type: string; payload: any }) => {
    if (action.type.includes('filtered-vaults') === true) return next(action);

    urlToFilters({
      url: getURLParams(),
      dispatcher: store.dispatch,
      chainsById: store.getState().entities.chains.byId, // TODO: this is not available on first load
    });

    return next(action);
  };
}
