import { memo, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectFiat,
  selectInputAmount,
  selectInputMode,
  selectNetwork,
  selectToken,
} from '../../../../../data/selectors/on-ramp';
import { validateOnRampForm } from '../../../../../data/actions/on-ramp';
import { debounce } from 'lodash';

export const FormValidator = memo(function FormValidator() {
  const dispatch = useAppDispatch();
  const inputAmount = useAppSelector(selectInputAmount);
  const inputMode = useAppSelector(selectInputMode);
  const fiat = useAppSelector(selectFiat);
  const token = useAppSelector(selectToken);
  const network = useAppSelector(selectNetwork);

  const debouncedValidate = useMemo(
    () => debounce(() => dispatch(validateOnRampForm()), 150),
    [dispatch]
  );

  useEffect(() => {
    debouncedValidate();
  }, [debouncedValidate, inputAmount, inputMode, fiat, token, network]);

  return null;
});
