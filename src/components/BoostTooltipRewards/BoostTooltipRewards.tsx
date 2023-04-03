import React, { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { VaultEntity } from '../../features/data/entities/vault';
import { Tooltip } from '../Tooltip';
import { AssetsImage } from '../AssetsImage';
import { useAppSelector } from '../../store';
import { useTranslation } from 'react-i18next';
import { selectUserRewardsByVaultId } from '../../features/data/selectors/balance';
import { TokenEntity } from '../../features/data/entities/token';
import BigNumber from 'bignumber.js';
import { formatBigNumber, formatBigUsd } from '../../helpers/format';

const useStyles = makeStyles(styles);

interface BoostTooltipRewardsProps {
  vaultId: VaultEntity['id'];
}

export const BoostTooltipRewards = memo<BoostTooltipRewardsProps>(({ vaultId }) => {
  const classes = useStyles();

  const { rewards, rewardsTokens } = useAppSelector(state =>
    selectUserRewardsByVaultId(state, vaultId)
  );

  if (rewards.length === 0) {
    return null;
  }

  return (
    <Tooltip content={<BoostTooltipcontent rewards={rewards} />}>
      <div className={classes.container}>
        <div className={classes.plus}>+</div>
        <AssetsImage chainId={vaultId} size={24} assetIds={rewardsTokens} />
      </div>
    </Tooltip>
  );
});

interface RewardsType {
  rewardToken: TokenEntity['oracleId'];
  rewards: BigNumber;
  rewardsUsd: BigNumber;
}

interface BoostTooltipContentProps {
  rewards: RewardsType[];
}

export const BoostTooltipcontent = memo<BoostTooltipContentProps>(function ({ rewards }) {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div>
      <div className={classes.tooltipTitle}>{t('Claimable rewards')}</div>
      <div className={classes.rewardsContainer}>
        {rewards.map(tokenRewards => {
          return (
            <div>
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
});
