import { memo } from 'react';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import {
  DashboardDataStatus,
  selectDashboardUserRewardsOrStatusByVaultId,
} from '../../features/data/selectors/dashboard.ts';
import { formatLargeUsd } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { RewardsTooltipContent } from '../RewardsTooltip/RewardsTooltip.tsx';
import { useTranslation } from 'react-i18next';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';

export type MobileVaultYieldStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

export const MobileVaultYieldStat = memo(function MobileVaultYieldStat({
  vaultId,
  walletAddress,
  ...passthrough
}: MobileVaultYieldStatProps) {
  const { t } = useTranslation();
  const label = t('VaultStat-Yield');
  const data = useAppSelector(state =>
    selectDashboardUserRewardsOrStatusByVaultId(state, vaultId, walletAddress)
  );

  if (data === DashboardDataStatus.Loading) {
    return <VaultValueStat label={label} value="-" loading={true} {...passthrough} />;
  }

  if (data === DashboardDataStatus.Missing) {
    return <VaultValueStat label={label} value="?" loading={false} {...passthrough} />;
  }

  if (!data.claimed.has && !data.compounded.has) {
    return null;
  }

  return (
    <VaultValueStat
      label={label}
      value={formatLargeUsd(data.compounded.usd.plus(data.claimed.usd))}
      tooltip={<RewardsTooltipContent compounded={true} claimed={true} rewards={data} />}
      loading={false}
      {...passthrough}
    />
  );
});
