import { memo, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectBridgeFormState,
  selectBridgeTokenForChainId,
} from '../../../../../data/selectors/bridge';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { validateBridgeForm } from '../../../../../data/actions/bridge';
import { debounce } from 'lodash-es';

type FormValidatorProps = {
  className?: string;
};

export const FormValidator = memo<FormValidatorProps>(function FormValidator({ className }) {
  const dispatch = useAppDispatch();
  const { from, to, input } = useAppSelector(selectBridgeFormState);
  const fromToken = useAppSelector(state => selectBridgeTokenForChainId(state, from));
  const toToken = useAppSelector(state => selectBridgeTokenForChainId(state, to));
  const userBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, fromToken.chainId, fromToken.address)
  );
  const inputAmount = input.amount;
  const debouncedValidate = useMemo(
    () => debounce(() => dispatch(validateBridgeForm()), 150),
    [dispatch]
  );

  useEffect(() => {
    debouncedValidate();
  }, [debouncedValidate, fromToken, toToken, inputAmount, userBalance]);

  return null;
});
