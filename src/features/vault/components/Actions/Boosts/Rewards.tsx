import type { BoostRewardContractData } from '../../../../data/apis/contract-data/contract-data-types.ts';
import { type BigNumber } from 'bignumber.js';
import { Fragment, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { css, type CssStyles } from '@repo/styles/css';
import { TokenImageFromEntity } from '../../../../../components/TokenImage/TokenImage.tsx';
import { TokenAmount } from '../../../../../components/TokenAmount/TokenAmount.tsx';
import { StakeCountdown } from './StakeCountdown/StakeCountdown.tsx';
import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type Reward = BoostRewardContractData & {
  pending: BigNumber;
  active: boolean;
  apr: number;
};

export type RewardsProps = {
  isInBoost: boolean;
  rewards: Reward[];
  fadeInactive?: boolean;
  css?: CssStyles;
};

export const Rewards = memo(function Rewards({
  isInBoost,
  rewards,
  css: cssProp,
  fadeInactive = true,
}: RewardsProps) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={css(styles.rewards, fadeInactive && styles.rewardsFadeInactive, cssProp)}>
      <div className={classes.rewardLabel}>{t('Boost-Rewards')}</div>
      <div className={classes.rewardLabel}>{t('Boost-Ends')}</div>
      {rewards.map(reward => (
        <Fragment key={reward.token.address}>
          <div
            className={css(
              styles.rewardValue,
              reward.active && styles.rewardValueActive,
              styles.rewardValueAmount
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
          <div className={css(styles.rewardValue, reward.active && styles.rewardValueActive)}>
            {!reward.active ?
              t('ENDED')
            : reward.isPreStake ?
              t('PRE-STAKE')
            : reward.periodFinish ?
              <StakeCountdown periodFinish={reward.periodFinish} />
            : '-'}
          </div>
        </Fragment>
      ))}
    </div>
  );
});
