import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactDualInputAmount,
  selectTransactInputAmount,
  selectTransactSelected,
} from '../../../../../data/selectors/transact';
import clsx from 'clsx';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import type { AmountInputProps } from '../AmountInput';
import { AmountInput } from '../AmountInput';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import BigNumber from 'bignumber.js';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens';

const useStyles = makeStyles(styles);

export type DepositTokenAmountInputProps = {
  className?: string;
};

export const DepositTokenAmountInput = memo<DepositTokenAmountInputProps>(
  function DepositTokenAmountInput({ className }) {
    const dispatch = useAppDispatch();
    const classes = useStyles();
    const selection = useAppSelector(selectTransactSelected);
    const depositToken = selection.tokens[0]; // TODO univ3; only 1 deposit token supported
    const userBalance = useAppSelector(state =>
      selectUserBalanceOfToken(state, depositToken.chainId, depositToken.address)
    );
    const value = useAppSelector(selectTransactInputAmount);
    const price = useAppSelector(state =>
      selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
    );
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

    const error = useMemo(() => {
      return value.gt(userBalance);
    }, [userBalance, value]);

    return (
      <AmountInput
        className={clsx(classes.input, className)}
        value={value}
        maxValue={userBalance}
        tokenDecimals={depositToken.decimals}
        onChange={handleChange}
        error={error}
        allowInputAboveBalance={true}
        fullWidth={true}
        price={price}
      />
    );
  }
);

type V3DepositTokenAmountInputProps = DepositTokenAmountInputProps & {
  index: number;
};

export const V3DepositTokenAmountInput = memo<V3DepositTokenAmountInputProps>(
  function DepositTokenAmountInput({ className, index }) {
    const dispatch = useAppDispatch();
    const classes = useStyles();
    const selection = useAppSelector(selectTransactSelected);
    const depositToken = selection.tokens[index];
    const userBalance = useAppSelector(state =>
      selectUserBalanceOfToken(state, depositToken.chainId, depositToken.address)
    );
    const value = useAppSelector(state => selectTransactDualInputAmount(state, index));
    const price = useAppSelector(state =>
      selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
    );

    const error = useMemo(() => {
      return value.gt(userBalance);
    }, [userBalance, value]);

    const handleChange = useCallback<AmountInputProps['onChange']>(
      (value, isMax) => {
        dispatch(
          transactActions.setDualInputAmount({
            amount: value.decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR),
            max: isMax,
            index,
          })
        );
      },
      [dispatch, depositToken, index]
    );

    return (
      <AmountInput
        className={clsx(classes.input, className)}
        value={value}
        maxValue={userBalance}
        tokenDecimals={depositToken.decimals}
        onChange={handleChange}
        error={error}
        allowInputAboveBalance={true}
        fullWidth={true}
        price={price}
      />
    );
  }
);
