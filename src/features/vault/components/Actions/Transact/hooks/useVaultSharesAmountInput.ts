import BigNumber from 'bignumber.js';
import { useCallback, useMemo } from 'react';
import { transactSetInputAmount } from '../../../../../data/actions/transact.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import {
  isVaultWithPricePerFullShare,
  type VaultEntity,
} from '../../../../../data/entities/vault.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInShareToken,
} from '../../../../../data/selectors/balance.ts';
import {
  selectTokenByAddress,
  selectTokenPriceByTokenOracleId,
} from '../../../../../data/selectors/tokens.ts';
import {
  selectTransactInputIndexAmount,
  selectTransactInputIndexEnteredAmount,
} from '../../../../../data/selectors/transact.ts';
import {
  selectVaultByIdWithReceipt,
  selectVaultPricePerFullShare,
} from '../../../../../data/selectors/vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  mooAmountToOracleAmount,
  oracleAmountToMooAmount,
} from '../../../../../data/utils/ppfs.ts';
import type { AmountInputProps } from '../AmountInput/AmountInput.tsx';

export function vaultSharesInputValue(
  shareToken: TokenEntity,
  depositToken: TokenEntity,
  ppfs: BigNumber,
  storedShares: BigNumber,
  enteredAmount: BigNumber | undefined
): BigNumber {
  if (
    enteredAmount &&
    oracleAmountToMooAmount(shareToken, depositToken, ppfs, enteredAmount).isEqualTo(storedShares)
  ) {
    return enteredAmount;
  }
  return mooAmountToOracleAmount(shareToken, depositToken, ppfs, storedShares);
}

export function useVaultSharesAmountInput(
  index: number,
  vaultId: VaultEntity['id'],
  /** what the route can actually spend, when that is not the wallet balance (e.g. staked in a boost) */
  available?: { shareBalance: BigNumber; depositBalance: BigNumber }
) {
  const dispatch = useAppDispatch();
  const vault = useAppSelector(state => selectVaultByIdWithReceipt(state, vaultId));
  const receiptToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress)
  );
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const ppfs = useAppSelector(state => selectVaultPricePerFullShare(state, vaultId));
  const walletShareBalance = useAppSelector(state =>
    selectUserVaultBalanceInShareToken(state, vaultId)
  );
  const walletDepositBalance = useAppSelector(state =>
    selectUserVaultBalanceInDepositToken(state, vaultId)
  );
  const shareBalance = available?.shareBalance ?? walletShareBalance;
  const depositBalance = available?.depositBalance ?? walletDepositBalance;
  const storeAmount = useAppSelector(state => selectTransactInputIndexAmount(state, index));
  const enteredAmount = useAppSelector(state =>
    selectTransactInputIndexEnteredAmount(state, index)
  );
  const price = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
  );

  const value = useMemo(
    () =>
      isVaultWithPricePerFullShare(vault) ?
        vaultSharesInputValue(receiptToken, depositToken, ppfs, storeAmount, enteredAmount)
      : storeAmount,
    [vault, receiptToken, depositToken, ppfs, storeAmount, enteredAmount]
  );

  const onChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
    (typedValue, isMax) => {
      if (isMax) {
        dispatch(transactSetInputAmount({ index, amount: shareBalance, max: true }));
        return;
      }
      const entered = typedValue.decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR);
      if (!isVaultWithPricePerFullShare(vault)) {
        dispatch(transactSetInputAmount({ index, amount: entered, max: false }));
        return;
      }
      dispatch(
        transactSetInputAmount({
          index,
          amount: oracleAmountToMooAmount(receiptToken, depositToken, ppfs, entered),
          max: false,
          enteredAmount: entered,
        })
      );
    },
    [dispatch, index, vault, receiptToken, depositToken, ppfs, shareBalance]
  );

  return {
    value,
    price,
    maxValue: depositBalance,
    onChange,
    tokenDecimals: depositToken.decimals,
  };
}
