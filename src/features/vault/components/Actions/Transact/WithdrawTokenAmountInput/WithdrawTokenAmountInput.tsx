import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import {
  selectTransactInputIndexAmount,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectUserVaultBalanceInDepositTokenWithToken } from '../../../../../data/selectors/balance.ts';
import type { AmountInputProps } from '../AmountInput/AmountInput.tsx';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens.ts';
import BigNumber from 'bignumber.js';
import { AmountInputWithSlider } from '../AmountInputWithSlider/AmountInputWithSlider.tsx';
import { TokenSelectButton } from '../TokenSelectButton/TokenSelectButton.tsx';
import { type CssStyles } from '@repo/styles/css';

export type WithdrawTokenAmountInputProps = {
  css?: CssStyles;
};

export const WithdrawTokenAmountInput = memo(function WithdrawTokenAmountInput({
  css: cssProp,
}: WithdrawTokenAmountInputProps) {
  const dispatch = useAppDispatch();

  const vaultId = useAppSelector(selectTransactVaultId);
  const { token: depositToken, amount: userBalance } = useAppSelector(state =>
    selectUserVaultBalanceInDepositTokenWithToken(state, vaultId)
  );
  const value = useAppSelector(state => selectTransactInputIndexAmount(state, 0));
  const price = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
  );

  const handleChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
    (value, isMax) => {
      dispatch(
        transactActions.setInputAmount({
          index: 0,
          amount: value.decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR),
          max: isMax,
        })
      );
    },
    [dispatch, depositToken.decimals]
  ) satisfies AmountInputProps['onChange'];

  return (
    <AmountInputWithSlider
      css={cssProp}
      maxValue={userBalance}
      onChange={handleChange}
      value={value}
      price={price}
      selectedToken={depositToken}
      endAdornment={<TokenSelectButton index={0} />}
    />
  );
});
