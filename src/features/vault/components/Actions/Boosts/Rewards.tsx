import type { BoostRewardContractData } from '../../../../data/apis/contract-data/contract-data-types';
import { type BigNumber } from 'bignumber.js';
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
    <div className={clsx(classes.rewards, fadeInactive && classes.rewardsFadeInactive, className)}>
      <div className={classes.rewardLabel}>{t('Boost-Rewards')}</div>
      <div className={classes.rewardLabel}>{t('Boost-Ends')}</div>
      {rewards.map(reward => (
        <Fragment key={reward.token.address}>
          <div
            className={clsx(
              classes.rewardValue,
              reward.active && classes.rewardValueActive,
              classes.rewardValueAmount
            )}
          >
            <TokenImageFromEntity token={reward.token} size={16} />
            <div className={classes.rewardEllipsis}>
              {isInBoost && (
                <TokenAmount amount={reward.pending} decimals={reward.token.decimals} />
              )}
              <span className={classes.rewardSymbol}>{reward.token.symbol}</span>
            </div>
          </div>
          <div className={clsx(classes.rewardValue, reward.active && classes.rewardValueActive)}>
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
