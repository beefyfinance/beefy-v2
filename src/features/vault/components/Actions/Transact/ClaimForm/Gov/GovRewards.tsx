import { memo, useMemo } from 'react';
import { type VaultEntity } from '../../../../../../data/entities/vault';
import type { ChainEntity } from '../../../../../../data/entities/chain';
import { makeStyles } from '@material-ui/core';
import { useAppSelector } from '../../../../../../../store';
import { BIG_ZERO } from '../../../../../../../helpers/big-number';
import { selectUserGovVaultUnifiedRewards } from '../../../../../../data/selectors/user-rewards';
import { Claim } from './Claim/Claim';
import { RewardList } from '../RewardList/RewardList';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type GovRewardsProps = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  walletAddress?: string;
  deposited: boolean;
};

export const GovRewards = memo<GovRewardsProps>(function GovRewards({
  vaultId,
  walletAddress,
  deposited,
}) {
  const classes = useStyles();
  const vaultRewards = useAppSelector(state =>
    selectUserGovVaultUnifiedRewards(state, vaultId, walletAddress)
  );
  const canClaim = useMemo(
    () => !!vaultRewards && vaultRewards.some(r => r.balance.gt(BIG_ZERO)),
    [vaultRewards]
  );

  if (!vaultRewards) {
    return null;
  }

  return (
    <div className={classes.container}>
      <div>Gov</div>
      <div className={classes.rewards}>
        <RewardList rewards={vaultRewards} deposited={deposited} />
      </div>
      {canClaim ? <Claim vaultId={vaultId} /> : null}
    </div>
  );
});
