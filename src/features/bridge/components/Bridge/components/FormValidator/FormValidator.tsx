import { debounce } from 'lodash-es';
import { memo, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { validateBridgeForm } from '../../../../../data/actions/bridge.ts';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance.ts';
import {
  selectBridgeDepositTokenForChainId,
  selectBridgeFormState,
} from '../../../../../data/selectors/bridge.ts';

export const FormValidator = memo(function FormValidator() {
  const dispatch = useAppDispatch();
  const { from, to, input, receiverIsDifferent, receiverAddress } =
    useAppSelector(selectBridgeFormState);
  const fromToken = useAppSelector(state => selectBridgeDepositTokenForChainId(state, from));
  const toToken = useAppSelector(state => selectBridgeDepositTokenForChainId(state, to));
  const userBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, fromToken.chainId, fromToken.address)
  );
  const inputAmount = input.amount;
  const debouncedValidate = useMemo(
    () =>
      debounce(() => {
        dispatch(validateBridgeForm());
      }, 250),
    [dispatch]
  );

  useEffect(() => {
    debouncedValidate();
  }, [
    debouncedValidate,
    fromToken,
    toToken,
    inputAmount,
    userBalance,
    receiverIsDifferent,
    receiverAddress,
  ]);

  return null;
});
