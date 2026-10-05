import { type CssStyles } from '@repo/styles/css';
import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSetTokenInputAmount } from '../../../../../data/actions/transact.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance.ts';
import {
  selectTokenInputDecimals,
  selectTokenPriceByTokenOracleId,
} from '../../../../../data/selectors/tokens.ts';
import {
  selectTransactDepositInputVaultId,
  selectTransactInputIndexAmount,
} from '../../../../../data/selectors/transact.ts';
import type { AmountInputProps } from '../AmountInput/AmountInput.tsx';
import { AmountInputWithSlider } from '../AmountInputWithSlider/AmountInputWithSlider.tsx';
import { TokenSelectButton } from '../TokenSelectButton/TokenSelectButton.tsx';
import { useVaultSharesAmountInput } from '../hooks/useVaultSharesAmountInput.ts';

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
  const fromVaultId = useAppSelector(selectTransactDepositInputVaultId);
  if (index === 0 && fromVaultId) {
    return <V2vDepositTokenAmountInput index={index} fromVaultId={fromVaultId} css={cssProp} />;
  }
  return <StandardDepositTokenAmountInput index={index} token={token} css={cssProp} />;
});

const StandardDepositTokenAmountInput = memo(function StandardDepositTokenAmountInput({
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
  const inputDecimals = useAppSelector(state => selectTokenInputDecimals(state, token));

  const handleChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
    (value, isMax) => {
      dispatch(transactSetTokenInputAmount({ index, token, amount: value, max: isMax }));
    },
    [dispatch, token, index]
  );

  return (
    <AmountInputWithSlider
      css={cssProp}
      value={value}
      price={price}
      maxValue={userBalance}
      onChange={handleChange}
      tokenDecimals={inputDecimals}
      endAdornment={<TokenSelectButton index={index} />}
    />
  );
});

type V2vProps = {
  index: number;
  fromVaultId: VaultEntity['id'];
  css?: CssStyles;
};

const V2vDepositTokenAmountInput = memo(function V2vDepositTokenAmountInput({
  index,
  fromVaultId,
  css: cssProp,
}: V2vProps) {
  const inputProps = useVaultSharesAmountInput(index, fromVaultId);
  return (
    <AmountInputWithSlider
      css={cssProp}
      {...inputProps}
      endAdornment={<TokenSelectButton index={index} />}
    />
  );
});
