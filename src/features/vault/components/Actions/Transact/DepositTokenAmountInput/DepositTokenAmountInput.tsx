import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactInputAmount,
  selectTransactSelectedTokens,
} from '../../../../../data/selectors/transact';
import clsx from 'clsx';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import type { AmountInputProps } from '../AmountInput';
import { AmountInput } from '../AmountInput';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles(styles);

export type DepositTokenAmountInputProps = {
  className?: string;
};

export const DepositTokenAmountInput = memo<DepositTokenAmountInputProps>(
  function DepositTokenAmountInput({ className }) {
    const dispatch = useAppDispatch();
    const classes = useStyles();
    const selectedTokens = useAppSelector(selectTransactSelectedTokens);
    const depositToken = selectedTokens[0]; // TODO univ3; only 1 deposit token supported
    const userBalance = useAppSelector(state =>
      selectUserBalanceOfToken(state, depositToken.chainId, depositToken.address)
    );
    const value = useAppSelector(selectTransactInputAmount);
    const handleChange = useCallback<AmountInputProps['onChange']>(
      (value, isMax) => {
        dispatch(
          transactActions.setInputAmount({
            amount: value.decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR),
            max: isMax,
          })
        );
      },
      [dispatch, depositToken]
    );

    return (
      <AmountInput
        className={clsx(classes.input, className)}
        value={value}
        maxValue={userBalance}
        tokenDecimals={depositToken.decimals}
        onChange={handleChange}
      />
    );
  }
);
