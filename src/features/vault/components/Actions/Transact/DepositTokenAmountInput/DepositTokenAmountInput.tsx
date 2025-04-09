import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectTransactInputIndexAmount } from '../../../../../data/selectors/transact.ts';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance.ts';
import type { AmountInputProps } from '../AmountInput/AmountInput.tsx';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import BigNumber from 'bignumber.js';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens.ts';
import { AmountInputWithSlider } from '../AmountInputWithSlider/AmountInputWithSlider.tsx';
import { TokenSelectButton } from '../TokenSelectButton/TokenSelectButton.tsx';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { type CssStyles } from '@repo/styles/css';

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
  const userBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, token.chainId, token.address)
  );
  const value = useAppSelector(state => selectTransactInputIndexAmount(state, index));
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, token.oracleId));

  const handleChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
    (value, isMax) => {
      dispatch(
        transactActions.setInputAmount({
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
      selectedToken={token}
      endAdornment={<TokenSelectButton index={index} />}
    />
  );
});
