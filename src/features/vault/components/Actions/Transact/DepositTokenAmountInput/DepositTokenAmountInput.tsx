import React, { memo, useCallback, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactDualInputAmount,
  selectTransactInputAmount,
  selectTransactSelected,
  selectTransactSelectedQuoteOrUndefined,
} from '../../../../../data/selectors/transact';

import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { type AmountInputProps } from '../AmountInput';

import { transactActions } from '../../../../../data/reducers/wallet/transact';
import BigNumber from 'bignumber.js';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens';

import { AmountInputWithSlider } from '../AmountInputWithSlider';
import { TokenSelectButton, V3TokenButton } from '../TokenSelectButton';
import { isCowcentratedDepositQuote } from '../../../../../data/apis/transact/transact-types';
import { BIG_ZERO } from '../../../../../../helpers/big-number';

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
        endAdornment={<TokenSelectButton />}
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
    const selection = useAppSelector(selectTransactSelected);
    const depositToken = selection.tokens[index];
    const userBalance = useAppSelector(state =>
      selectUserBalanceOfToken(state, depositToken.chainId, depositToken.address)
    );
    const value = useAppSelector(state => selectTransactDualInputAmount(state, index));
    const price = useAppSelector(state =>
      selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
    );

    const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);

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

    const handleSliderChange = useCallback(
      (value: number) => {
        dispatch(
          transactActions.setDualInputAmount({
            amount: userBalance
              .multipliedBy(value / 100)
              .decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR),
            max: value === 100,
            index,
          })
        );
      },
      [depositToken.decimals, dispatch, index, userBalance]
    );

    const noSingleSideAllowed = useMemo(() => {
      return quote
        ? isCowcentratedDepositQuote(quote) &&
            quote.outputs.every(inputToken => inputToken.amount.eq(BIG_ZERO)) &&
            value.gt(BIG_ZERO)
        : false;
    }, [quote, value]);

    return (
      <AmountInputWithSlider
        className={className}
        value={value}
        price={price}
        maxValue={userBalance}
        onChange={handleChange}
        onSliderChange={handleSliderChange}
        selectedToken={depositToken}
        endAdornment={<V3TokenButton token={depositToken} />}
        warning={noSingleSideAllowed}
      />
    );
  }
);
