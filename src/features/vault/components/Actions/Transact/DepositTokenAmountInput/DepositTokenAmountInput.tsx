import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
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
import { TokenSelectButton } from '../TokenSelectButton';
import { BIG_ONE, BIG_ZERO } from '../../../../../../helpers/big-number';

const useStyles = makeStyles(styles);

export type DepositTokenAmountInputProps = {
  className?: string;
};

export const DepositTokenAmountInput = memo<DepositTokenAmountInputProps>(
  function DepositTokenAmountInput({ className }) {
    const dispatch = useAppDispatch();
    const classes = useStyles();
    const selection = useAppSelector(selectTransactSelected);
    const depositToken = selection?.tokens[0]; // TODO univ3; only 1 deposit token supported
    const userBalance = useAppSelector(state =>
      depositToken
        ? selectUserBalanceOfToken(state, depositToken.chainId, depositToken.address)
        : BIG_ZERO
    );
    const value = useAppSelector(selectTransactInputAmount);
    const price = useAppSelector(state =>
      depositToken ? selectTokenPriceByTokenOracleId(state, depositToken.oracleId) : BIG_ONE
    );
    const handleChange = useCallback<AmountInputProps['onChange']>(
      (value, isMax) => {
        dispatch(
          transactActions.setInputAmount({
            amount: value.decimalPlaces(depositToken?.decimals ?? 18, BigNumber.ROUND_FLOOR),
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
        tokenDecimals={depositToken?.decimals ?? 18}
        onChange={handleChange}
        error={error}
        allowInputAboveBalance={true}
        fullWidth={true}
        price={price}
        endAdornement={
          <>
            <TokenSelectButton />
          </>
        }
      />
    );
  }
);
