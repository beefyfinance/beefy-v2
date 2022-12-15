import { useHistory, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store';
import { useState, useEffect } from 'react';

/**
 * It syncs a boolean value between the URL and Redux
 * @param  - key - the key to use in the URL
 */
export function useSyncedVaultBoolKey({
  key,
  reduxAction,
  selector,
}: {
  key: string;
  selector: any;
  reduxAction: any;
}) {
  const stateValue = useAppSelector<boolean>(selector);
  const dispatch = useAppDispatch();

  const location = useLocation();
  const history = useHistory();

  const [_oldValue, _setOldValue] = useState<boolean>(stateValue);

  /**
   * This useEffect handles the changes in the vault filters
   * triggered from the UI
   */
  useEffect(() => {
    const { search } = location;
    const values = new URLSearchParams(search);
    const changedUI = _oldValue !== stateValue;
    if (changedUI) {
      // If the value is false, there is no point to display it in the URL
      if (stateValue === false) {
        values.delete(key);
      } else {
        values.set(key, stateValue.toString());
      }
      // Here we update the URL WITHOUT triggering a reload
      history.push(`?${values.toString()}`);
      _setOldValue(stateValue);
    }
  }, [_oldValue, history, key, location, stateValue]);

  /**
   * This useEffect handles the changes in the vault filters
   * triggered from the URL
   */
  useEffect(() => {
    const { search } = location;
    const values = new URLSearchParams(search);
    // Keep an eye on this: it is a safe way to cast a string into a boolean
    // Don't use things like Boolean(var) since they can lead to false positives (https://stackoverflow.com/a/264037)
    const urlValue = values.get(key) === 'true';
    const changedURL = _oldValue !== urlValue;

    if (changedURL) {
      dispatch(reduxAction(urlValue));
      _setOldValue(urlValue);
    }
  }, [_oldValue, dispatch, history, key, location, reduxAction, stateValue]);
}
