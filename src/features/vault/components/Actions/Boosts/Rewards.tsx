import type { BoostRewardContractData } from '../../../../data/apis/contract-data/contract-data-types';
import type BigNumber from 'bignumber.js';
import { Fragment, memo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { TokenImageFromEntity } from '../../../../../components/TokenImage/TokenImage';
import { TokenAmount } from '../../../../../components/TokenAmount';
import { StakeCountdown } from './StakeCountdown';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type Reward = BoostRewardContractData & {
  pending: BigNumber;
  active: boolean;
};

export type RewardsProps = {
  isInBoost: boolean;
  rewards: Reward[];
  fadeInactive?: boolean;
  className?: string;
};

export const Rewards = memo(function Rewards({
  isInBoost,
  rewards,
  className,
  fadeInactive = true,
}: RewardsProps) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div
      className={clsx(
        classes.boostStats,
        fadeInactive && classes.boostStatsFadeInactive,
        className
      )}
    >
      <div className={classes.boostStatLabel}>{t('Boost-Rewards')}</div>
      <div className={classes.boostStatLabel}>{t('Boost-Ends')}</div>
      {rewards.map(reward => (
        <Fragment key={reward.token.address}>
          <div
            className={clsx(classes.boostStatValue, reward.active && classes.boostStatValueActive)}
          >
            <TokenImageFromEntity token={reward.token} size={16} />
            {isInBoost && <TokenAmount amount={reward.pending} decimals={reward.token.decimals} />}
            {reward.token.symbol}
          </div>
          <div
            className={clsx(classes.boostStatValue, reward.active && classes.boostStatValueActive)}
          >
            {!reward.active ? (
              t('ENDED')
            ) : reward.isPreStake ? (
              t('PRE-STAKE')
            ) : reward.periodFinish ? (
              <StakeCountdown periodFinish={reward.periodFinish} />
            ) : (
              '-'
            )}
          </div>
        </Fragment>
      ))}
    </div>
  );
});
