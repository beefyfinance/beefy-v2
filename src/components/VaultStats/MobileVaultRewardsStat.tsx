import { memo } from 'react';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import {
  DashboardDataStatus,
  selectDashboardUserRewardsOrStatusByVaultId,
} from '../../features/data/selectors/dashboard.ts';
import { useTranslation } from 'react-i18next';
import { formatLargeUsd } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { PendingRewardsIconWithTooltip } from '../RewardsTooltip/RewardsTooltip.tsx';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';

export type MobileVaultRewardsStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

export const MobileVaultRewardsStat = memo(function MobileVaultRewardsStat({
  vaultId,
  walletAddress,
  ...passthrough
}: MobileVaultRewardsStatProps) {
  const { t } = useTranslation();
  const label = t('VaultStat-Claimable-Rewards');
  const data = useAppSelector(state =>
    selectDashboardUserRewardsOrStatusByVaultId(state, vaultId, walletAddress)
  );

  if (data === DashboardDataStatus.Loading) {
    return <VaultValueStat label={label} value="-" loading={true} {...passthrough} />;
  }

  if (data === DashboardDataStatus.Missing) {
    return <VaultValueStat label={label} value="?" loading={false} {...passthrough} />;
  }

  if (!data.pending.has) {
    return null;
  }

  return (
    <VaultValueStat
      label={label}
      value={<PendingRewardsIconWithTooltip size={20} rewards={data} />}
      subValue={formatLargeUsd(data.pending.usd)}
      loading={false}
      {...passthrough}
    />
  );
});
