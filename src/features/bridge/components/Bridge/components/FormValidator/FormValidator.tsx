import React, { memo, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectBridgeFormState,
  selectBridgeTokenForChainId,
} from '../../../../../data/selectors/bridge';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { fromWeiString } from '../../../../../../helpers/big-number';
import { validateBridgeForm } from '../../../../../data/actions/bridge';
import { debounce } from 'lodash-es';

const useStyles = makeStyles(styles);

type FormValidatorProps = {
  className?: string;
};

export const FormValidator = memo<FormValidatorProps>(function FormValidator({ className }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { from, to, input } = useAppSelector(selectBridgeFormState);
  const fromToken = useAppSelector(state => selectBridgeTokenForChainId(state, from));
  const toToken = useAppSelector(state => selectBridgeTokenForChainId(state, to));
  const minAmount = useMemo(() => fromWeiString('1000', fromToken.decimals), [fromToken]);
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

  return <div className={clsx(classes.group, className)}>todo: form validation</div>;
});
