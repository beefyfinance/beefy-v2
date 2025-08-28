import { createSelector } from '@reduxjs/toolkit';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectIsBalanceAvailableForChainUser,
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken,
  selectUserVaultBalanceInUsdIncludingDisplaced,
} from '../../features/data/selectors/balance.ts';

import { selectIsPricesAvailable } from '../../features/data/selectors/prices.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import {
  selectIsBalanceHidden,
  selectWalletAddress,
} from '../../features/data/selectors/wallet.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { formatLargeUsd } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { TokenAmountFromEntity } from '../TokenAmount/TokenAmount.tsx';
import { ValueBlock } from '../ValueBlock/ValueBlock.tsx';
import { VaultDepositedTooltip } from '../VaultDepositedTooltip/VaultDepositedTooltip.tsx';

type VaultDepositedProps = {
  vaultId: VaultEntity['id'];
};

export const VaultDeposited = memo(function VaultDeposited({ vaultId }: VaultDepositedProps) {
  const { t } = useTranslation();
  const { hasDeposit, hasDisplacedDeposit, deposit, depositUsd, depositToken, blurred, loading } =
    useAppSelector(state => selectVaultDepositedStat(state, vaultId));
  return (
    <ValueBlock
      label={t('Vault-deposited')}
      value={<TokenAmountFromEntity amount={deposit} token={depositToken} />}
      usdValue={hasDeposit ? depositUsd : null}
      tooltip={hasDisplacedDeposit ? <VaultDepositedTooltip vaultId={vaultId} /> : undefined}
      blurred={blurred}
      loading={loading}
    />
  );
});

// TODO better selector / hook
const selectVaultDepositedStat = createSelector(
  [
    selectVaultById,
    selectWalletAddress,
    selectIsPricesAvailable,
    selectIsBalanceHidden,
    (state: BeefyState, _vaultId: VaultEntity['id']) => state,
  ],
  (vault, walletAddress, isPricesAvailable, isBalanceHidden, state) => {
    const isLoaded =
      !!walletAddress &&
      isPricesAvailable &&
      selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress);

    const { amount: deposit, token: depositToken } =
      selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken(state, vault.id);
    const baseDeposit = selectUserVaultBalanceInDepositToken(state, vault.id);
    const hasDeposit = deposit.gt(0);
    const depositUsd = formatLargeUsd(
      selectUserVaultBalanceInUsdIncludingDisplaced(state, vault.id)
    );

    return {
      vaultId: vault.id,
      hasDeposit,
      hasDisplacedDeposit: hasDeposit && deposit.gt(baseDeposit),
      deposit,
      depositUsd,
      depositToken,
      blurred: isBalanceHidden,
      loading: !!walletAddress && !isLoaded,
    };
  }
);
