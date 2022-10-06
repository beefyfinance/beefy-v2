import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactInputAmount,
  selectTransactSelectedTokens,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import clsx from 'clsx';
import { AmountInput, AmountInputProps } from '../AmountInput';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { AmountInputMax } from '../AmountInput/InputAmountMax';
import { transactActions } from '../../../../../data/reducers/wallet/transact';

const useStyles = makeStyles(styles);

export type TokenSelectButtonProps = {
  className?: string;
};

export const DepositTokenAmountInput = memo<TokenSelectButtonProps>(function ({ className }) {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const selectedTokens = useAppSelector(selectTransactSelectedTokens);
  const depositToken = selectedTokens[0];
  const userBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, depositToken.chainId, depositToken.address)
  );
  const value = useAppSelector(selectTransactInputAmount);
  const handleChange = useCallback<AmountInputProps['onChange']>(
    value => {
      dispatch(transactActions.setInputAmount(value));
    },
    [dispatch]
  );

  return (
    <AmountInputMax
      className={clsx(classes.input, className)}
      value={value}
      onChange={handleChange}
      maxDecimals={depositToken.decimals}
      max={userBalance}
    />
  );
});
