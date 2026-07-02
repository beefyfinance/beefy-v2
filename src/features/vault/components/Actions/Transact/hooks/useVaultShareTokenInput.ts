import BigNumber from 'bignumber.js';
import { useCallback, useMemo } from 'react';
import { transactSetInputAmount } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInShareToken,
  selectVaultSharesToDepositTokenData,
} from '../../../../../data/selectors/balance.ts';
import { selectTransactInputIndexAmount } from '../../../../../data/selectors/transact.ts';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  mooAmountToOracleAmount,
  oracleAmountToMooAmount,
} from '../../../../../data/utils/ppfs.ts';
import type { AmountInputProps } from '../AmountInput/AmountInput.tsx';

export type VaultShareTokenInput = {
  value: BigNumber;
  maxValue: BigNumber;
  price: BigNumber;
  tokenDecimals: number;
  onChange: NonNullable<AmountInputProps['onChange']>;
};

// store-of-record at inputAmounts[index] is share-math; returns the deposit-token display value/max/price
// and an onChange that writes back share-math. Receipt-token-tolerant, so it also serves gov/single-gov.
export function useVaultShareTokenInput(
  vaultId: VaultEntity['id'],
  index: number
): VaultShareTokenInput {
  const dispatch = useAppDispatch();
  const shareData = useAppSelector(state => selectVaultSharesToDepositTokenData(state, vaultId));
  const storeAmount = useAppSelector(state => selectTransactInputIndexAmount(state, index));
  const maxValue = useAppSelector(state => selectUserVaultBalanceInDepositToken(state, vaultId));
  const shareBalance = useAppSelector(state => selectUserVaultBalanceInShareToken(state, vaultId));
  const { depositToken, shareToken, ppfs } = shareData;
  const price = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
  );

  const value = useMemo(
    () =>
      shareToken ?
        mooAmountToOracleAmount(shareToken, depositToken, ppfs, storeAmount)
      : storeAmount,
    [shareToken, depositToken, ppfs, storeAmount]
  );

  const onChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
    (typedValue, isMax) => {
      const amount =
        isMax ? shareBalance
        : shareToken ? oracleAmountToMooAmount(shareToken, depositToken, ppfs, typedValue)
        : typedValue.decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR);
      dispatch(transactSetInputAmount({ index, amount, max: isMax }));
    },
    [dispatch, shareToken, depositToken, ppfs, shareBalance, index]
  );

  return { value, maxValue, price, tokenDecimals: depositToken.decimals, onChange };
}
