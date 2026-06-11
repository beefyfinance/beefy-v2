import { type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSetInputAmount } from '../../../../../data/actions/transact.ts';
import {
  isGovVault,
  isVaultWithPricePerFullShare,
  type VaultEntity,
} from '../../../../../data/entities/vault.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenWithToken,
  selectUserVaultBalanceInShareToken,
} from '../../../../../data/selectors/balance.ts';
import {
  selectTokenByAddress,
  selectTokenPriceByTokenOracleId,
} from '../../../../../data/selectors/tokens.ts';
import {
  selectTransactInputIndexAmount,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import {
  selectVaultById,
  selectVaultByIdWithReceipt,
  selectVaultPricePerFullShare,
} from '../../../../../data/selectors/vaults.ts';
import {
  mooAmountToOracleAmount,
  oracleAmountToMooAmount,
} from '../../../../../data/utils/ppfs.ts';
import type { AmountInputProps } from '../AmountInput/AmountInput.tsx';
import { AmountInputWithSlider } from '../AmountInputWithSlider/AmountInputWithSlider.tsx';
import { TokenSelectButton } from '../TokenSelectButton/TokenSelectButton.tsx';

export type WithdrawTokenAmountInputProps = {
  css?: CssStyles;
};

export const WithdrawTokenAmountInput = memo(function WithdrawTokenAmountInput({
  css: cssProp,
}: WithdrawTokenAmountInputProps) {
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  if (isGovVault(vault)) {
    return <GovWithdrawTokenAmountInput css={cssProp} />;
  }
  return <SharesWithdrawTokenAmountInput vaultId={vaultId} css={cssProp} />;
});

const GovWithdrawTokenAmountInput = memo(function GovWithdrawTokenAmountInput({
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

type SharesProps = {
  vaultId: VaultEntity['id'];
  css?: CssStyles;
};

// store-of-record is the share amount; user sees/types the deposit-token equivalent
const SharesWithdrawTokenAmountInput = memo(function SharesWithdrawTokenAmountInput({
  vaultId,
  css: cssProp,
}: SharesProps) {
  const dispatch = useAppDispatch();
  const vault = useAppSelector(state => selectVaultByIdWithReceipt(state, vaultId));
  const receiptToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress)
  );
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const ppfs = useAppSelector(state => selectVaultPricePerFullShare(state, vaultId));
  const shareBalance = useAppSelector(state => selectUserVaultBalanceInShareToken(state, vaultId));
  const depositBalance = useAppSelector(state =>
    selectUserVaultBalanceInDepositToken(state, vaultId)
  );
  const storeAmount = useAppSelector(state => selectTransactInputIndexAmount(state, 0));
  const price = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
  );

  const value = useMemo(
    () =>
      isVaultWithPricePerFullShare(vault) ?
        mooAmountToOracleAmount(receiptToken, depositToken, ppfs, storeAmount)
      : storeAmount,
    [vault, receiptToken, depositToken, ppfs, storeAmount]
  );

  const handleChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
    (typedValue, isMax) => {
      let amount: BigNumber;
      if (isMax) {
        amount = shareBalance;
      } else if (isVaultWithPricePerFullShare(vault)) {
        amount = oracleAmountToMooAmount(receiptToken, depositToken, ppfs, typedValue);
      } else {
        amount = typedValue.decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR);
      }
      dispatch(transactSetInputAmount({ index: 0, amount, max: isMax }));
    },
    [dispatch, vault, receiptToken, depositToken, ppfs, shareBalance]
  );

  return (
    <AmountInputWithSlider
      css={cssProp}
      maxValue={depositBalance}
      onChange={handleChange}
      value={value}
      price={price}
      tokenDecimals={depositToken.decimals}
      endAdornment={<TokenSelectButton index={0} />}
    />
  );
});
