import { BeefyStore } from '../../../redux-types';
import { filteredVaultsActions } from '../reducers/filtered-vaults';

const syncMap: {
  reduxActionKey: string;
  reduxKey: string;
  reduxActionDispatcher: Function;
  urlKey: string;
  addToURLCondition: (payload: any) => boolean;
  reduxPayloadCustomParser?: (payload: any, store?: BeefyStore) => string;
  urlPayloadCustomParser?: (value: string, store: BeefyStore) => any;
  customExtraActionCondition?: (payload: any) => boolean; // You can pass this function to add a custom condition
  // when triggering actions in the Redux to URL middleware (check for example the "onlyRetired" one)
}[] = [
  {
    reduxActionKey: 'filtered-vaults/setVaultType',
    reduxKey: 'vaultType',
    reduxActionDispatcher: filteredVaultsActions.setVaultType,
    urlKey: 'type',
    addToURLCondition: (payload: string) => {
      return payload && payload !== 'all';
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setSortFieldAndDirection',
    reduxKey: 'sort',
    reduxActionDispatcher: filteredVaultsActions.setSort,
    urlKey: 'sort',
    addToURLCondition: (payload: { field: string; direction: string }) => {
      return payload.field && payload.field !== 'default';
    },
    reduxPayloadCustomParser: (payload: { field: string; direction: string }) => {
      return payload.field as string;
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setSortFieldAndDirection',
    reduxKey: 'sortDirection',
    reduxActionDispatcher: filteredVaultsActions.setSortDirection,
    urlKey: 'sortDirection',
    addToURLCondition: (payload: { field: string; direction: string }) => {
      return payload.direction && payload.direction !== 'desc';
    },
    reduxPayloadCustomParser: (payload: { field: string; direction: string }) => {
      return payload.direction as string;
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setSortDirection',
    reduxKey: 'sortDirection',
    reduxActionDispatcher: filteredVaultsActions.setSortDirection,
    urlKey: 'sortDirection',
    addToURLCondition: (payload: string) => {
      return payload && payload !== 'desc';
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setVaultCategory',
    reduxKey: 'vaultCategory',
    reduxActionDispatcher: filteredVaultsActions.setVaultCategory,
    urlKey: 'vaultCategory',
    addToURLCondition: (payload: string) => {
      return payload && payload !== 'all';
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setUserCategory',
    reduxKey: 'userCategory',
    reduxActionDispatcher: filteredVaultsActions.setUserCategory,
    urlKey: 'userCategory',
    addToURLCondition: (payload: string) => {
      return payload && payload !== 'all';
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setSearchText',
    reduxKey: 'searchText',
    reduxActionDispatcher: filteredVaultsActions.setSearchText,
    urlKey: 'searchText',
    addToURLCondition: (payload: string) => {
      return payload && payload.trim() !== '';
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setPlatformId',
    reduxKey: 'platformId',
    reduxActionDispatcher: filteredVaultsActions.setPlatformId,
    urlKey: 'platform',
    addToURLCondition: (payload: string) => {
      return !!payload;
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setBoolean',
    reduxKey: 'onlyRetired',
    reduxActionDispatcher: filteredVaultsActions.setOnlyRetired,
    urlKey: 'onlyRetired',
    addToURLCondition: (payload: { filter: string; value: boolean }) => {
      return payload && payload.value;
    },
    reduxPayloadCustomParser: (payload: { filter: string; value: boolean }) => {
      return payload.value.toString();
    },
    customExtraActionCondition: (payload: { filter: string; value: boolean }) => {
      return payload.filter === 'onlyRetired';
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setBoolean',
    reduxKey: 'onlyPaused',
    reduxActionDispatcher: filteredVaultsActions.setOnlyPaused,
    urlKey: 'onlyPaused',
    addToURLCondition: (payload: { filter: string; value: boolean }) => {
      return payload && payload.value;
    },
    reduxPayloadCustomParser: (payload: { filter: string; value: boolean }) => {
      return payload.value.toString();
    },
    customExtraActionCondition: (payload: { filter: string; value: boolean }) => {
      return payload.filter === 'onlyPaused';
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setBoolean',
    reduxKey: 'onlyBoosted',
    reduxActionDispatcher: filteredVaultsActions.setOnlyBoosted,
    urlKey: 'onlyBoosted',
    addToURLCondition: (payload: { filter: string; value: boolean }) => {
      return payload && payload.value;
    },
    reduxPayloadCustomParser: (payload: { filter: string; value: boolean }) => {
      return payload.value.toString();
    },
    customExtraActionCondition: (payload: { filter: string; value: boolean }) => {
      return payload.filter === 'onlyBoosted';
    },
  },
  {
    reduxActionKey: 'filtered-vaults/setChainIds',
    reduxKey: 'chainIds',
    reduxActionDispatcher: filteredVaultsActions.setChainIds,
    urlKey: 'chains',
    addToURLCondition: (payload: Array<string>) => {
      return payload && payload.length > 0;
    },
    urlPayloadCustomParser: (value:string, store:BeefyStore) => {
        const paramItems: Array<string> = (value ?? '')
        .split(',')
        .reduce((acc, item) => (acc.includes(item) ? acc : [...acc, item]), []);

        const chainsById = store.getState().entities.chains.byId;

      // Now we need to iterate those items to return an Array<string> containing the equivalent
      // chainID for each chain name
      return paramItems
        .filter(item => {
          const _item = Object.values(chainsById).find(
            element => element.name.toLowerCase() === item.replaceAll('+', ' ').toLowerCase()
          );
          
          if (!_item) return false;

          return true;
        })
        .map(item => {
          const _item = Object.values(chainsById).find(
            element => element.name.toLowerCase() === item.replaceAll('+', ' ').toLowerCase()
          );
          return _item.id;
        });
    },
    reduxPayloadCustomParser: (payload: Array<string>, store: BeefyStore) => {
      const chainsById = store.getState().entities.chains.byId;

      return payload
        .filter(chainID => {
          const _item = chainsById[chainID];
          if (!_item) return false;

          return true;
        })
        .map(chainID => {
          const _item = chainsById[chainID];

          return _item.name.toLowerCase();
        })
        .join(',');
    },
  },
];

/**
 * This is the Redux middleware to handle changes from Redux Vaults Filters to
 * URL display
 * @param store
 */
export function urlUpdateActionsMiddleware(store:BeefyStore) {
    return next => async (action: {type: string, payload: any}) => {
        // Since inside this middleware we can dispatch actions in redux with this type
        // If one action of that type reaches this middleware, we should bypass this middleware
        // Because if not, we will enter in an endless loop
        if(action.type.includes("filtered-vaults")) return next(action);

        const values = new URLSearchParams(window.location.hash.replace('#/', ''));

        syncMap.forEach(syncItem => {
            const urlValue = values.get(syncItem.urlKey);
            const stateValue = store.getState().ui.filteredVaults[syncItem.reduxKey];

            // If the url value is empty, we exit, nothing to change
            if(!urlValue) return;
            // If the state value is an array, we have to handle a special behaviour
            // since we can not just compare arrays with ===
            if(Array.isArray(stateValue)) {
                // Since we don't have a way to process the array, we exit
                if(typeof syncItem.urlPayloadCustomParser !== 'function') return;

                const _parsedUrlValue = syncItem.urlPayloadCustomParser(urlValue, store);

                // If the url value of the array is the same as the one in the store, we exit
                if(_parsedUrlValue.join(",")===stateValue.join(",")) return;

                // If they are not equal, we have to update the redux for that property
                //store.dispatch(filteredVaultsActions.setChainIds())
                store.dispatch(syncItem.reduxActionDispatcher(_parsedUrlValue));
            } else {
                // If the value is not an array, we can just compare with ===
                // But make sure to cast a string the state value, because it could be a number
                // or a bool, and the urlValue is always a string
                // If they are equal, url didn't change, so no pointing continuing
                if(urlValue === (stateValue??"").toString()) return;
                store.dispatch(syncItem.reduxActionDispatcher(urlValue))
            }
        })

        return next(action);
    }
}

/**
 * This is the Redux middleware to handle changes from the URL to Redux Vault
 * Filters
 * @param store
 */
export function vaultsFilteringActionsMiddleware(store: BeefyStore) {
  return next => async (action: { type: string; payload: any }) => {
    // There is one special action: the reset one. If we got that one, we just reset the URL
    // We don't need to do anything else
    if (action.type === 'filtered-vaults/reset') {
      const newURL = window.location;
      newURL.hash = `#/`;
      window.history.replaceState(null, null, newURL.toString());
      return next(action);
    }

    // Check if there are actions that matches our targeted redux actions inside our sync map
    const syncItems = syncMap.filter(syncItem => {
      const _baseCondition = syncItem.reduxActionKey === action.type;

      if (typeof syncItem.customExtraActionCondition !== 'function') return _baseCondition;

      return _baseCondition && syncItem.customExtraActionCondition(action.payload);
    });

    // If there are not, bypass this middleware
    if (syncItems.length < 1) return next(action);

    const values = new URLSearchParams(window.location.hash.replace('#/', ''));

    syncItems.forEach(syncItem => {
      let proposedNewParamValue = '';

      if (typeof syncItem.reduxPayloadCustomParser === 'function') {
        proposedNewParamValue = syncItem.reduxPayloadCustomParser(action.payload, store);
      } else {
        proposedNewParamValue = action.payload;
      }

      if (syncItem.addToURLCondition(action.payload)) {
        values.set(syncItem.urlKey, proposedNewParamValue);
      } else {
        values.delete(syncItem.urlKey);
      }
    });

    const newURL = window.location;
    let queryParamsString = '';

    if (values.toString().length > 0) {
      queryParamsString = `?${values.toString()}`;
    }

    // Finally, we update the URL!
    newURL.hash = `#/${queryParamsString}`;
    window.history.replaceState(null, null, newURL.toString());

    return next(action);
  };
}
