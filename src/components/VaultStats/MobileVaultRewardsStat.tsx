import { isGovVault, type VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { formatLargeUsd } from '../../helpers/format';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { RewardsTooltip } from '../RewardsTooltip/RewardsTooltip';
import { useAppSelector } from '../../store';
import { selectUserRewardsByVaultId } from '../../features/data/selectors/balance';
import { BIG_ZERO } from '../../helpers/big-number';

export type MobileVaultRewardsStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

export const MobileVaultRewardsStat = memo<MobileVaultRewardsStatProps>(
  function MobileVaultRewardsStat({ vaultId, walletAddress, ...passthrough }) {
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const label = 'VaultStat-Claimable-Rewards';
    const data = useAppSelector(state => selectUserRewardsByVaultId(state, vaultId, walletAddress));
    const hasRewards = isGovVault(vault) || (data && data.totalRewardsUsd.gt(BIG_ZERO));

    if (!hasRewards) {
      return null;
    }

    if (!data) {
      return <VaultValueStat label={label} value="-" loading={true} {...passthrough} />;
    }

    return (
      <VaultValueStat
        label={label}
        value={<RewardsTooltip size={20} vaultId={vaultId} walletAddress={walletAddress} />}
        subValue={formatLargeUsd(data.totalRewardsUsd)}
        loading={false}
        {...passthrough}
      />
    );
  }
);
