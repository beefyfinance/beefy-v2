import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactInputAmount,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import clsx from 'clsx';
import { selectUserVaultDepositInDepositTokenExcludingBoosts } from '../../../../../data/selectors/balance';
import { AmountInput, AmountInputProps } from '../AmountInput';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { BigNumber } from 'bignumber.js';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';

const useStyles = makeStyles(styles);

export type WithdrawTokenAmountInputProps = {
  className?: string;
};

export const WithdrawTokenAmountInput = memo<WithdrawTokenAmountInputProps>(
  function WithdrawTokenAmountInput({ className }) {
    const dispatch = useAppDispatch();
    const classes = useStyles();
    const vaultId = useAppSelector(selectTransactVaultId);
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const depositToken = useAppSelector(state =>
      selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
    );
    const userBalance = useAppSelector(state =>
      selectUserVaultDepositInDepositTokenExcludingBoosts(state, vaultId)
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
        maxDecimals={depositToken.decimals}
        onChange={handleChange}
      />
    );
  }
);
