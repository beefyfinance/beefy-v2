import type { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { formatBigUsd } from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import { selectUserRewardsByVaultId } from '../../features/data/selectors/balance';
import { RewardsTooltip } from '../RewardsTooltip/RewardsTooltip';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsWalletKnown } from '../../features/data/selectors/wallet';

export type VaultRewardsStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultRewardsStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultRewardsStatProps) {
  const label = 'VaultStat-Claimable Rewards';

  const vault = selectVaultById(state, vaultId);

  const isLoaded =
    state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
      ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
      : true;

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
    };
  }

  const { totalRewardsUsd } = selectUserRewardsByVaultId(state, vaultId);

  return {
    label,
    value: <RewardsTooltip size={20} vaultId={vaultId} />,
    subValue: formatBigUsd(totalRewardsUsd),
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: null,
  };
}
