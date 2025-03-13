import { memo, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import {
  selectFiatOrUndefined,
  selectInputAmount,
  selectInputModeOrUndefined,
  selectNetworkOrUndefined,
  selectTokenOrUndefined,
} from '../../../../../data/selectors/on-ramp.ts';
import { validateOnRampForm } from '../../../../../data/actions/on-ramp.ts';
import { debounce } from 'lodash-es';

export const FormValidator = memo(function FormValidator() {
  const dispatch = useAppDispatch();
  const inputAmount = useAppSelector(selectInputAmount);
  const inputMode = useAppSelector(selectInputModeOrUndefined);
  const fiat = useAppSelector(selectFiatOrUndefined);
  const token = useAppSelector(selectTokenOrUndefined);
  const network = useAppSelector(selectNetworkOrUndefined);

  const debouncedValidate = useMemo(
    () =>
      debounce(() => {
        dispatch(validateOnRampForm());
      }, 150),
    [dispatch]
  );

  useEffect(() => {
    debouncedValidate();
  }, [debouncedValidate, inputAmount, inputMode, fiat, token, network]);

  return null;
});
