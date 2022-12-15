import { useHistory, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';


/**
 * It syncs a string value from the URL to the Redux store and vice versa.
 * @param  - key - the key to use in the URL
 */
export function useSyncedVaultStringKey({
  key,
  reduxAction,
  selector,
  validationFunction,
  defaultValue
}: {
  key: string;
  selector: any;
  reduxAction: any;
  validationFunction?: (proposedValue: string) => boolean;
  defaultValue?: string;
}) {
  const stateValue = useAppSelector<string>(selector);
  const dispatch = useAppDispatch();

  const location = useLocation();
  const history = useHistory();

  const [_oldValue, _setOldValue] = useState<string>("");

    /**
   * This useEffect handles the changes in the vault filters
   * triggered from the UI
   */
  useEffect(() => {
    const { search } = location;
    const values = new URLSearchParams(search);
    const changedUI = _oldValue !== stateValue;
    if (changedUI) {
      // If the value is null or if it is equal to the default value we can pass to the hook, there is no point to display it in the URL
      if(!stateValue || stateValue === defaultValue) {
        values.delete(key);
      }else{
        values.set(key, stateValue.toString());
      }

      history.push(`?${values.toString()}`);
      _setOldValue(stateValue);

    }
  }, [_oldValue, defaultValue, history, key, location, stateValue]);

  /**
   * This useEffect handles the changes in the vault filters
   * triggered from the URL
   */
  useEffect(() => {
    const { search } = location;
    const values = new URLSearchParams(search);
    const urlValue = values.get(key);
    
    const changedURL = urlValue !== null && _oldValue !== urlValue;

    if (changedURL) {
      // If there is a validationFunction, we execute it. It is used to validate
      // user inputs in the URL
      if (typeof validationFunction === 'function' && !validationFunction(urlValue)) return;
      dispatch(reduxAction(urlValue));
      _setOldValue(urlValue);
    }
  }, [_oldValue, dispatch, history, key, location, reduxAction, stateValue, validationFunction]);
}
