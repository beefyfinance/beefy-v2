import { useHistory, useLocation } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { selectFilterChainIds } from '../features/data/selectors/filtered-vaults';
import { filteredVaultsActions } from '../features/data/reducers/filtered-vaults';
import { areArraysEqual } from '../helpers/utils';

/**
 * It syncs the vault chains value from the URL to the Redux store and vice versa.
 * @param  - key - the key to use in the URL
 */
export function useSyncedVaultChains({ key }: { key: string }) {
  const stateValue = useAppSelector(selectFilterChainIds);
  const chainsById = useAppSelector(state => state.entities.chains.byId);
  const dispatch = useAppDispatch();

  const location = useLocation();
  const history = useHistory();

  const [_oldValue, _setOldValue] = useState(stateValue);

  /**
   * This function converts an array of chain IDs (the data we store in the Redux filters)
   * to a valid URL param (chain1,chain2,chain3...) and it also converts those chain IDs
   * into their canonical names (as specified in the requirements of this task).
   * Obviously it is inside a useCallback to improve a little the performance.
   */
  const chainIDArrayToURLParam = useCallback(
    (chainIDArray: Array<string>) => {
      return chainIDArray
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
    [chainsById]
  );

  /**
   * This function converts the chains URL param to a valid array of chain IDs.
   * Since in the URL it could be any random data (since it is an input from the user),
   * we have to do extra checks to convert the data to a valid array of chain IDs.
   * Obviously it is inside a useCallback to improve a little the performance.
   */
  const urlParamToChainIDArray = useCallback(
    (param: string) => {
      // We need the chains in the param as an Array<string> and it should contain only unique items
      // So with this one liner, we achieve that!
      const paramItems: Array<string> = (param ?? '')
        .split(',')
        .reduce((acc, item) => (acc.includes(item) ? acc : [...acc, item]), []);

      // Now we need to iterate those items to return an Array<string> containing the equivalent
      // chainID for each chain name
      return paramItems
        .filter(item => {
          const _item = Object.values(chainsById).find(
            element => element.name.toLowerCase() === item.replaceAll('+', ' ').toLowerCase()
          );
          //console.warn("CHECKING", item, _item, chainsById)
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
    [chainsById]
  );

  /**
   * This useEffect handles the changes in the vault chains filter
   * triggered from the UI
   */
  useEffect(() => {
    if (!chainsById || Object.keys(chainsById).length < 1) return;
    const { search } = location;
    const values = new URLSearchParams(search);

    const changedUI = !areArraysEqual<string>(_oldValue, stateValue);
    if (changedUI) {
      if (!stateValue || stateValue.length < 1) {
        values.delete(key);
      } else {
        values.set(key, chainIDArrayToURLParam(stateValue));
      }

      history.push(`?${values.toString()}`);
      _setOldValue(stateValue);
    }
  }, [_oldValue, history, key, location, stateValue, chainsById, chainIDArrayToURLParam]);

  /**
   * This useEffect handles the changes in the vault chains filter
   * triggered from the URL
   */
  useEffect(() => {
    if (!chainsById || Object.keys(chainsById).length < 1) return;

    const { search } = location;
    const values = new URLSearchParams(search);
    const urlValue = urlParamToChainIDArray(values.get(key));
    const changedURL = !areArraysEqual<string>(_oldValue, urlValue);

    if (changedURL) {
      dispatch(filteredVaultsActions.setChainIds(urlValue));
      _setOldValue(urlValue);
    }
  }, [_oldValue, dispatch, history, key, location, stateValue, chainsById, urlParamToChainIDArray]);
}
