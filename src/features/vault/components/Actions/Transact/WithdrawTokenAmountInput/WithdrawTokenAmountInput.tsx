import { type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSetInputAmount } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens.ts';
import {
  selectTransactInputIndexAmount,
  selectTransactIsActiveSelectionVaultSourceWithdraw,
  selectTransactVaultId,
  selectTransactWithdrawAvailableInShareToken,
  selectTransactWithdrawAvailableWithToken,
} from '../../../../../data/selectors/transact.ts';
import type { AmountInputProps } from '../AmountInput/AmountInput.tsx';
import { AmountInputWithSlider } from '../AmountInputWithSlider/AmountInputWithSlider.tsx';
import { TokenSelectButton } from '../TokenSelectButton/TokenSelectButton.tsx';
import { useVaultSharesAmountInput } from '../hooks/useVaultSharesAmountInput.ts';

export type WithdrawTokenAmountInputProps = {
  css?: CssStyles;
};

export const WithdrawTokenAmountInput = memo(function WithdrawTokenAmountInput({
  css: cssProp,
}: WithdrawTokenAmountInputProps) {
  const vaultId = useAppSelector(selectTransactVaultId);
  const isVaultSourceWithdraw = useAppSelector(selectTransactIsActiveSelectionVaultSourceWithdraw);
  if (vaultId && isVaultSourceWithdraw) {
    return <VaultSourceWithdrawTokenAmountInput vaultId={vaultId} css={cssProp} />;
  }
  return <StandardWithdrawTokenAmountInput css={cssProp} />;
});

const StandardWithdrawTokenAmountInput = memo(function StandardWithdrawTokenAmountInput({
  css: cssProp,
}: WithdrawTokenAmountInputProps) {
  const dispatch = useAppDispatch();
  const { token: depositToken, amount: userBalance } = useAppSelector(
    selectTransactWithdrawAvailableWithToken
  );
  const value = useAppSelector(state => selectTransactInputIndexAmount(state, 0));
  const price = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
  );

  const handleChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
    (value, isMax) => {
      dispatch(
        transactSetInputAmount({
          index: 0,
          amount: value.decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR),
          max: isMax,
        })
      );
    },
    [dispatch, depositToken.decimals]
  );

  return (
    <AmountInputWithSlider
      css={cssProp}
      maxValue={userBalance}
      onChange={handleChange}
      value={value}
      price={price}
      tokenDecimals={depositToken.decimals}
      endAdornment={<TokenSelectButton index={0} />}
    />
  );
});

type VaultSourceProps = {
  vaultId: VaultEntity['id'];
  css?: CssStyles;
};

const VaultSourceWithdrawTokenAmountInput = memo(function VaultSourceWithdrawTokenAmountInput({
  vaultId,
  css: cssProp,
}: VaultSourceProps) {
  // the wallet share balance the hook defaults to reads 0 while the position sits in a boost
  const shareBalance = useAppSelector(selectTransactWithdrawAvailableInShareToken);
  const depositBalance = useAppSelector(selectTransactWithdrawAvailableWithToken).amount;
  const inputProps = useVaultSharesAmountInput(0, vaultId, { shareBalance, depositBalance });
  return (
    <AmountInputWithSlider
      css={cssProp}
      {...inputProps}
      endAdornment={<TokenSelectButton index={0} />}
    />
  );
});
