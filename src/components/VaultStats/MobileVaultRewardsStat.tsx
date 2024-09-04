import { type VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { formatLargeUsd } from '../../helpers/format';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat';
import { PendingRewardsIconWithTooltip } from '../RewardsTooltip/RewardsTooltip';
import { useAppSelector } from '../../store';
import {
  DashboardDataStatus,
  selectDashboardUserRewardsOrStatusByVaultId,
} from '../../features/data/selectors/dashboard';

export type MobileVaultRewardsStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

export const MobileVaultRewardsStat = memo<MobileVaultRewardsStatProps>(
  function MobileVaultRewardsStat({ vaultId, walletAddress, ...passthrough }) {
    const label = 'VaultStat-Claimable-Rewards';
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
  }
);
