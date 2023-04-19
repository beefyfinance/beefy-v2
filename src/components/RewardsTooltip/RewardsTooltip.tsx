import React, { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import type { VaultEntity } from '../../features/data/entities/vault';
import { Tooltip } from '../Tooltip';
import { AssetsImage } from '../AssetsImage';
import { useAppSelector } from '../../store';
import { useTranslation } from 'react-i18next';
import { selectUserRewardsByVaultId } from '../../features/data/selectors/balance';
import type { TokenEntity } from '../../features/data/entities/token';
import type BigNumber from 'bignumber.js';
import { formatBigNumber, formatBigUsd } from '../../helpers/format';

const useStyles = makeStyles(styles);

interface RewardsTooltipProps {
  vaultId: VaultEntity['id'];
  size?: number;
}

export const RewardsTooltip = memo<RewardsTooltipProps>(function RewardsTooltip({
  vaultId,
  size = 20,
}) {
  const classes = useStyles();

  const { rewards, rewardsTokens } = useAppSelector(state =>
    selectUserRewardsByVaultId(state, vaultId)
  );

  if (rewards.length === 0) {
    return null;
  }

  return (
    <Tooltip content={<RewardsTooltipContent rewards={rewards} />}>
      <div className={classes.container}>
        <AssetsImage chainId={vaultId} size={size} assetIds={rewardsTokens} />
      </div>
    </Tooltip>
  );
});

interface RewardsType {
  rewardToken: TokenEntity['oracleId'];
  rewards: BigNumber;
  rewardsUsd: BigNumber;
}

interface RewardsTooltipContentProps {
  rewards: RewardsType[];
}

export const RewardsTooltipContent = memo<RewardsTooltipContentProps>(
  function RewardsTooltipContent({ rewards }) {
    const { t } = useTranslation();
    const classes = useStyles();
    return (
      <div>
        <div className={classes.tooltipTitle}>{t('Claimable rewards')}</div>
        <div className={classes.rewardsContainer}>
          {rewards.map(tokenRewards => {
            return (
              <div key={tokenRewards.rewardToken}>
                <div className={classes.rewardsText}>
                  {formatBigNumber(tokenRewards.rewards)} {tokenRewards.rewardToken}
                </div>
                <div className={classes.usdPrice}>{formatBigUsd(tokenRewards.rewardsUsd)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
