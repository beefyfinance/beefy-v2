import { createSelector } from '@reduxjs/toolkit';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken,
  selectUserVaultBalanceInUsdIncludingDisplaced,
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

const selectVaultDepositedStat = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectUserVaultBalanceInDepositToken(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectUserVaultBalanceInUsdIncludingDisplaced(state, vaultId),
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
  (
    { amount: deposit, token: depositToken },
    baseDeposit,
    depositUsdAmount,
    blurred,
    walletAddress,
    isLoaded
  ) => {
    const hasDeposit = deposit.gt(0);

    return {
      hasDeposit,
      hasDisplacedDeposit: hasDeposit && deposit.gt(baseDeposit),
      deposit,
      depositUsd: formatLargeUsd(depositUsdAmount),
      depositToken,
      blurred,
      loading: !!walletAddress && !isLoaded,
    };
  }
);
