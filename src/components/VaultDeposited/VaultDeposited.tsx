import { createSelector } from '@reduxjs/toolkit';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { isCowcentratedVault, type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectHeldClmSideIds } from '../../features/data/selectors/analytics.ts';
import {
  selectUserRowDeposit,
  selectUserRowDepositIncludingDisplaced,
  selectUserRowDepositInUsd,
  selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken,
} from '../../features/data/selectors/balance.ts';

import { selectIsPricesAvailable } from '../../features/data/selectors/data-loader/prices.ts';
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
import { selectIsBalanceAvailableForChainUser } from '../../features/data/selectors/data-loader/balance.ts';

type VaultDepositedProps = {
  vaultId: VaultEntity['id'];
};

export const VaultDeposited = memo(function VaultDeposited({ vaultId }: VaultDepositedProps) {
  const { t } = useTranslation();
  const { hasDeposit, hasBreakdown, sides, deposit, depositUsd, depositToken, blurred, loading } =
    useAppSelector(state => selectVaultDepositedStat(state, vaultId));
  return (
    <ValueBlock
      label={t(sides > 1 ? 'Vault-deposited_plural' : 'Vault-deposited')}
      value={
        <TokenAmountFromEntity
          amount={deposit}
          token={depositToken}
          disableTooltip={hasBreakdown}
        />
      }
      usdValue={hasDeposit ? depositUsd : null}
      tooltip={hasBreakdown ? <VaultDepositedTooltip vaultId={vaultId} /> : undefined}
      blurred={blurred}
      loading={loading}
    />
  );
});

// same row totals as the list's Deposited stat, so a merged CLM reads the same on both screens
const selectVaultDepositedStat = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken(state, vaultId).token,
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectUserRowDepositIncludingDisplaced(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectUserRowDeposit(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectUserRowDepositInUsd(state, vaultId),
  (state: BeefyState) => selectIsBalanceHidden(state),
  (state: BeefyState) => selectWalletAddress(state),
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const walletAddress = selectWalletAddress(state);
    if (!walletAddress) {
      return false;
    }
    const vault = selectVaultById(state, vaultId);
    return (
      selectIsPricesAvailable(state) &&
      selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress)
    );
  },
  // a merged CLM held on both sides has a split to show, boosts or no boosts
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return isCowcentratedVault(vault) ? selectHeldClmSideIds(state, vaultId).length : 1;
  },
  (
    depositToken,
    deposit,
    baseDeposit,
    depositUsdAmount,
    blurred,
    walletAddress,
    isLoaded,
    sides
  ) => {
    const hasDeposit = deposit.gt(0);

    return {
      hasDeposit,
      sides,
      hasBreakdown: hasDeposit && (deposit.gt(baseDeposit) || sides > 1),
      deposit,
      depositUsd: formatLargeUsd(depositUsdAmount),
      depositToken,
      blurred,
      loading: !!walletAddress && !isLoaded,
    };
  }
);
