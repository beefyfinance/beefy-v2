import { type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSetInputAmount } from '../../../../../data/actions/transact.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import {
  selectUserBalanceOfToken,
  selectUserVaultBalanceInDepositToken,
} from '../../../../../data/selectors/balance.ts';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens.ts';
import {
  selectTransactDepositFromVaultId,
  selectTransactInputIndexAmount,
  selectTransactIsDepositFromVault,
} from '../../../../../data/selectors/transact.ts';
import type { AmountInputProps } from '../AmountInput/AmountInput.tsx';
import { AmountInputWithSlider } from '../AmountInputWithSlider/AmountInputWithSlider.tsx';
import { TokenSelectButton } from '../TokenSelectButton/TokenSelectButton.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';

export type DepositTokenAmountInputProps = {
  index: number;
  token: TokenEntity;
  css?: CssStyles;
};

export const DepositTokenAmountInput = memo(function DepositTokenAmountInput({
  index,
  token,
  css: cssProp,
}: DepositTokenAmountInputProps) {
  const dispatch = useAppDispatch();
  const fromVaultId = useAppSelector(selectTransactDepositFromVaultId);
  const isFromVaultMode = useAppSelector(selectTransactIsDepositFromVault);
  const isDepositFromVault = isFromVaultMode && index === 0;
  const fromVaultBalance = useAppSelector(state =>
    fromVaultId ? selectUserVaultBalanceInDepositToken(state, fromVaultId) : BIG_ZERO
  );
  const walletBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, token.chainId, token.address)
  );
  const userBalance = isDepositFromVault ? fromVaultBalance : walletBalance;
  const value = useAppSelector(state => selectTransactInputIndexAmount(state, index));
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, token.oracleId));

  const handleChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
    (value, isMax) => {
      dispatch(
        transactSetInputAmount({
          index,
          amount: value.decimalPlaces(token.decimals, BigNumber.ROUND_FLOOR),
          max: isMax,
        })
      );
    },
    [dispatch, token.decimals, index]
  );

  return (
    <AmountInputWithSlider
      css={cssProp}
      value={value}
      price={price}
      maxValue={userBalance}
      onChange={handleChange}
      tokenDecimals={token.decimals}
      endAdornment={<TokenSelectButton index={index} />}
    />
  );
});
