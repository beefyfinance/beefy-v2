import { type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSetInputAmount } from '../../../../../data/actions/transact.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { DepositSource, TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectUserBalanceOfToken,
  selectUserVaultBalanceInDepositToken,
} from '../../../../../data/selectors/balance.ts';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens.ts';
import {
  selectTransactDepositFromVaultId,
  selectTransactDepositSource,
  selectTransactInputIndexAmount,
  selectTransactOptionsMode,
  selectTransactUserHasOtherDepositedVaults,
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
  const mode = useAppSelector(selectTransactOptionsMode);
  const depositSource = useAppSelector(selectTransactDepositSource);
  const hasOtherDeposits = useAppSelector(selectTransactUserHasOtherDepositedVaults);
  const fromVaultId = useAppSelector(selectTransactDepositFromVaultId);
  const isDepositFromVault =
    mode === TransactMode.Deposit &&
    hasOtherDeposits &&
    depositSource === DepositSource.Vault &&
    index === 0;
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
