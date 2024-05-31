import React, { memo, useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactInputAmount,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { selectUserVaultDepositInDepositTokenExcludingBoostsBridged } from '../../../../../data/selectors/balance';
import type { AmountInputProps } from '../AmountInput';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import {
  selectTokenByAddress,
  selectTokenPriceByTokenOracleId,
} from '../../../../../data/selectors/tokens';
import BigNumber from 'bignumber.js';
import { AmountInputWithSlider } from '../AmountInputWithSlider';
import { TokenSelectButton } from '../TokenSelectButton';

export type WithdrawTokenAmountInputProps = {
  className?: string;
};

export const WithdrawTokenAmountInput = memo<WithdrawTokenAmountInputProps>(
  function WithdrawTokenAmountInput({ className }) {
    const dispatch = useAppDispatch();

    const vaultId = useAppSelector(selectTransactVaultId);
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const depositToken = useAppSelector(state =>
      selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
    );
    const userBalance = useAppSelector(state =>
      selectUserVaultDepositInDepositTokenExcludingBoostsBridged(state, vaultId)
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
    ) satisfies AmountInputProps['onChange'];

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
        maxValue={userBalance}
        onChange={handleChange}
        onSliderChange={handleSliderChange}
        value={value}
        price={price}
        selectedToken={depositToken}
        endAdornment={<TokenSelectButton />}
      />
    );
  }
);
