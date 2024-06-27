import { memo, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { keyBy } from 'lodash-es';
import { type VaultEntity } from '../../../../../../data/entities/vault';
import {
  selectUserMerklUnifiedRewardsForChain,
  selectUserMerklUnifiedRewardsForVault,
  type UnifiedReward,
} from '../../../../../../data/selectors/user-rewards';
import { useAppSelector } from '../../../../../../../store';
import type { ChainEntity } from '../../../../../../data/entities/chain';
import { formatUsd } from '../../../../../../../helpers/format';
import { BIG_ZERO } from '../../../../../../../helpers/big-number';
import { Claim } from './Claim/Claim';
import { styles } from './styles';
import { RewardList } from '../RewardList/RewardList';

const useStyles = makeStyles(styles);

type MerklRewardsProps = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  walletAddress?: string;
  deposited: boolean;
};

export const MerklRewards = memo<MerklRewardsProps>(function MerklRewards({
  vaultId,
  chainId,
  walletAddress,
  deposited,
}) {
  const classes = useStyles();
  const vaultRewards = useAppSelector(state =>
    selectUserMerklUnifiedRewardsForVault(state, vaultId, walletAddress)
  );
  const claimableVaultRewards = useMemo(
    () => !!vaultRewards && vaultRewards.some(r => r.balance.gt(BIG_ZERO)),
    [vaultRewards]
  );

  if (!vaultRewards) {
    return null;
  }

  return (
    <div className={classes.container}>
      <div>Merkl</div>
      <div className={classes.rewards}>
        <RewardList rewards={vaultRewards} deposited={deposited} />
        {walletAddress && claimableVaultRewards ? (
          <OtherRewards
            chainId={chainId}
            vaultRewards={vaultRewards}
            walletAddress={walletAddress}
          />
        ) : null}
      </div>
      {claimableVaultRewards ? <Claim chainId={chainId} /> : null}
    </div>
  );
});

type OtherRewardsProps = {
  chainId: ChainEntity['id'];
  vaultRewards: UnifiedReward[] | undefined;
  walletAddress: string;
};

const OtherRewards = memo<OtherRewardsProps>(function OtherRewards({
  chainId,
  vaultRewards,
  walletAddress,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [otherOpen, setOtherOpen] = useState<boolean>(false);
  const chainRewards = useAppSelector(state =>
    selectUserMerklUnifiedRewardsForChain(state, chainId, walletAddress)
  );
  const otherRewards = useMemo(() => {
    if (!chainRewards) {
      return undefined;
    }
    if (!vaultRewards) {
      return chainRewards.filter(reward => reward.balance.gt(BIG_ZERO));
    }

    const vaultRewardsByToken = keyBy(vaultRewards, r => r.token.address);
    return chainRewards
      .map(reward => ({
        ...reward,
        balance: reward.balance.minus(vaultRewardsByToken[reward.token.address]?.balance || 0),
      }))
      .filter(reward => reward.balance.gt(BIG_ZERO));
  }, [vaultRewards, chainRewards]);
  const otherRewardsUsd = useMemo(() => {
    return otherRewards
      ? otherRewards.reduce((sum, reward) => {
          return sum.plus(reward.price ? reward.price.multipliedBy(reward.balance) : BIG_ZERO);
        }, BIG_ZERO)
      : BIG_ZERO;
  }, [otherRewards]);
  const onToggle = useCallback(() => {
    setOtherOpen(v => !v);
  }, [setOtherOpen]);

  if (!otherRewards) {
    return null;
  }

  return (
    <div className={clsx(classes.otherRewards, { [classes.otherRewardsOpen]: otherOpen })}>
      <button onClick={onToggle} className={classes.otherRewardsToggle}>
        {t('Rewards-OtherRewards', { value: formatUsd(otherRewardsUsd) })}
        {otherOpen ? (
          <ExpandLess className={classes.otherRewardsToggleIcon} viewBox="5 7.59 16.43 9.41" />
        ) : (
          <ExpandMore className={classes.otherRewardsToggleIcon} viewBox="5 7.59 16.43 9.41" />
        )}
      </button>
      {otherOpen ? <RewardList rewards={otherRewards} deposited={false} /> : null}
    </div>
  );
});
