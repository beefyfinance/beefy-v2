import { memo, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectBridgeFormState,
  selectBridgeDepositTokenForChainId,
} from '../../../../../data/selectors/bridge';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { validateBridgeForm } from '../../../../../data/actions/bridge';
import { debounce } from 'lodash-es';

export const FormValidator = memo(function FormValidator() {
  const dispatch = useAppDispatch();
  const { from, to, input } = useAppSelector(selectBridgeFormState);
  const fromToken = useAppSelector(state => selectBridgeDepositTokenForChainId(state, from));
  const toToken = useAppSelector(state => selectBridgeDepositTokenForChainId(state, to));
  const userBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, fromToken.chainId, fromToken.address)
  );
  const inputAmount = input.amount;
  const debouncedValidate = useMemo(
    () => debounce(() => dispatch(validateBridgeForm()), 250),
    [dispatch]
  );

  useEffect(() => {
    debouncedValidate();
  }, [debouncedValidate, fromToken, toToken, inputAmount, userBalance]);

  return null;
});
