import React, { memo, useCallback, useMemo, useState } from 'react';
import type { VaultEntity } from '../../../../../data/entities/vault';
import {
  selectUserHasMerklRewardsForVault,
  selectUserMerklRewardsForChain,
  selectUserMerklRewardsForVault,
} from '../../../../../data/selectors/rewards';
import { useAppSelector } from '../../../../../../store';
import type { ChainEntity } from '../../../../../data/entities/chain';
import { formatUsd } from '../../../../../../helpers/format';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { keyBy } from 'lodash-es';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { Claim } from './Claim/Claim';
import { RewardList } from './RewardList/RewardList';
import clsx from 'clsx';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import merklLogo from '../../../../../../images/partners/merkl.svg';

const useStyles = makeStyles(styles);

type MerklProps = {
  vaultId: VaultEntity['id'];
};

export const Merkl = memo<MerklProps>(function Merkl({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const hasRewards = useAppSelector(state => selectUserHasMerklRewardsForVault(state, vaultId));
  if (!hasRewards) {
    return null;
  }
  return <MerklCard vaultId={vaultId} chainId={vault.chainId} />;
});

type MerklCardProps = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
};

const MerklCard = memo<MerklCardProps>(function MerklCard({ vaultId, chainId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [otherOpen, setOtherOpen] = useState<boolean>(false);
  const vaultRewards = useAppSelector(state => selectUserMerklRewardsForVault(state, vaultId));
  const chainRewards = useAppSelector(state => selectUserMerklRewardsForChain(state, chainId));
  const otherRewards = useMemo(() => {
    const vaultRewardsByToken = keyBy(vaultRewards, 'address');
    return chainRewards
      .map(reward => ({
        ...reward,
        unclaimed: reward.unclaimed.minus(vaultRewardsByToken[reward.address]?.unclaimed || 0),
        accumulated: reward.accumulated.minus(
          vaultRewardsByToken[reward.address]?.accumulated || 0
        ),
      }))
      .filter(reward => reward.unclaimed.gt(BIG_ZERO));
  }, [vaultRewards, chainRewards]);
  const otherRewardsUsd = useMemo(() => {
    return otherRewards.reduce((sum, reward) => {
      return sum.plus(reward.price ? reward.price.multipliedBy(reward.unclaimed) : BIG_ZERO);
    }, BIG_ZERO);
  }, [otherRewards]);
  const onToggle = useCallback(() => {
    setOtherOpen(v => !v);
  }, [setOtherOpen]);

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>
        <img src={merklLogo} alt={'Merkl'} className={classes.titleLogo} width="32" height="32" />
        {t('Rewards-Title')}
      </h2>
      <div className={classes.description}>{t('Rewards-Description')}</div>
      <div className={classes.rewards}>
        <RewardList chainId={chainId} rewards={vaultRewards} />
        {otherRewards.length ? (
          <div className={clsx(classes.otherRewards, { [classes.otherRewardsOpen]: otherOpen })}>
            <button onClick={onToggle} className={classes.otherRewardsToggle}>
              {t('Rewards-OtherRewards', { value: formatUsd(otherRewardsUsd) })}
              {otherOpen ? (
                <ExpandLess
                  className={classes.otherRewardsToggleIcon}
                  viewBox="5 7.59 16.43 9.41"
                />
              ) : (
                <ExpandMore
                  className={classes.otherRewardsToggleIcon}
                  viewBox="5 7.59 16.43 9.41"
                />
              )}
            </button>
            {otherOpen ? <RewardList chainId={chainId} rewards={otherRewards} /> : null}
          </div>
        ) : null}
      </div>
      <Claim chainId={chainId} />
    </div>
  );
});
