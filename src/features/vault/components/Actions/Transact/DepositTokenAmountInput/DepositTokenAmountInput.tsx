import React, { memo, useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactInputAmount,
  selectTransactSelected,
} from '../../../../../data/selectors/transact';

import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import type { AmountInputProps } from '../AmountInput';

import { transactActions } from '../../../../../data/reducers/wallet/transact';
import BigNumber from 'bignumber.js';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens';

import { AmountInputWithSlider } from '../AmountInputWithSlider';

export type DepositTokenAmountInputProps = {
  className?: string;
};

export const DepositTokenAmountInput = memo<DepositTokenAmountInputProps>(
  function DepositTokenAmountInput({ className }) {
    const dispatch = useAppDispatch();
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
      [dispatch, depositToken.decimals]
    );

    const handleSliderChange = useCallback(
      (value: number) => {
        dispatch(
          transactActions.setInputAmount({
            amount: userBalance
              .multipliedBy(value / 100)
              .decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR),
            max: value === 100,
          })
        );
      },
      [depositToken.decimals, dispatch, userBalance]
    );

    return (
      <AmountInputWithSlider
        className={className}
        value={value}
        price={price}
        maxValue={userBalance}
        onChange={handleChange}
        onSliderChange={handleSliderChange}
        selectedToken={depositToken}
      />
    );
  }
);
