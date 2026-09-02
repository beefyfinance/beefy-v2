import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getCowcentratedWrapperIds,
  isCowcentratedVault,
  type VaultEntity,
} from '../../features/data/entities/vault.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingDisplaced,
  selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken,
  selectUserVaultBalanceInUsdIncludingDisplaced,
} from '../../features/data/selectors/balance.ts';
import { BIG_ZERO } from '../../helpers/big-number.ts';

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

// TODO better selector / hook
const selectVaultDepositedStat = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  const walletAddress = selectWalletAddress(state);
  const isLoaded =
    !!walletAddress &&
    selectIsPricesAvailable(state) &&
    selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress);

  // a merged CLM page sums deposits across the whole group; all members share the CLM token unit
  const isGroup = isCowcentratedVault(vault);
  const memberIds = isGroup ? [vault.id, ...getCowcentratedWrapperIds(vault)] : [vault.id];

  const { amount: firstDeposit, token: depositToken } =
    selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken(state, vault.id);
  const deposit = memberIds
    .slice(1)
    .reduce(
      (sum, id) => sum.plus(selectUserVaultBalanceInDepositTokenIncludingDisplaced(state, id)),
      firstDeposit
    );
  const baseDeposit = memberIds.reduce(
    (sum, id) => sum.plus(selectUserVaultBalanceInDepositToken(state, id)),
    BIG_ZERO
  );
  const hasDeposit = deposit.gt(0);
  const depositUsd = formatLargeUsd(
    memberIds.reduce(
      (sum, id) => sum.plus(selectUserVaultBalanceInUsdIncludingDisplaced(state, id)),
      BIG_ZERO
    )
  );
  const blurred = selectIsBalanceHidden(state);

  return {
    vaultId,
    hasDeposit,
    // displaced tooltip breaks balances down per vault id, which a merged group can't use
    hasDisplacedDeposit: !isGroup && hasDeposit && deposit.gt(baseDeposit),
    deposit,
    depositUsd,
    depositToken,
    blurred,
    loading: !!walletAddress && !isLoaded,
  };
};
