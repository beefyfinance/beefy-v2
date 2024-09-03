import { memo, useMemo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import type { VaultEntity } from '../../features/data/entities/vault';
import { Tooltip } from '../Tooltip';
import { AssetsImage } from '../AssetsImage';
import { useAppSelector } from '../../store';
import { useTranslation } from 'react-i18next';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format';
import {
  selectDashboardUserRewardsByVaultId,
  type UserReward,
  type UserRewards,
  type UserRewardSource,
  type UserRewardStatus,
} from '../../features/data/selectors/dashboard';
import { uniq } from 'lodash-es';
import { getMostCommon, isDefined } from '../../features/data/utils/array-utils';
import { ucFirstLetter } from '../../helpers/string';
import { groupByMap } from '../../helpers/collection';

const useStyles = makeStyles(styles);

export type PendingRewardsIconWithTooltipForVaultProps = {
  vaultId: VaultEntity['id'];
  size?: number;
  walletAddress?: string;
};

export const PendingRewardsIconWithTooltipForVault =
  memo<PendingRewardsIconWithTooltipForVaultProps>(function PendingRewardsIconWithTooltipForVault({
    vaultId,
    walletAddress,
    ...rest
  }) {
    const rewards = useAppSelector(state =>
      selectDashboardUserRewardsByVaultId(state, vaultId, walletAddress)
    );

    if (!rewards.pending.has) {
      return null;
    }

    return <PendingRewardsIconWithTooltip rewards={rewards} {...rest} />;
  });

type PendingRewardsIconWithTooltipProps = {
  rewards: UserRewards;
  size?: number;
};

export const PendingRewardsIconWithTooltip = memo<PendingRewardsIconWithTooltipProps>(
  function PendingRewardsIconWithTooltip({ rewards, size = 20 }) {
    const classes = useStyles();
    const { pending } = rewards;
    const tokens = useMemo(
      () =>
        pending.has
          ? {
              chainId: getMostCommon(pending.rewards.map(r => r.token.chainId)),
              symbols: uniq(pending.rewards.map(r => r.token.symbol)),
            }
          : undefined,
      [pending]
    );

    if (!tokens) {
      return null;
    }

    return (
      <Tooltip content={<StatusRewards status={'pending'} rewards={pending.rewards} />}>
        <div className={classes.container}>
          <AssetsImage chainId={tokens.chainId} size={size || 20} assetSymbols={tokens.symbols} />
        </div>
      </Tooltip>
    );
  }
);

export type RewardsTooltipContentProps = {
  rewards: UserRewards;
} & {
  [status in UserRewardStatus]?: boolean;
};

export const RewardsTooltipContent = memo<RewardsTooltipContentProps>(
  function RewardsTooltipContent({ rewards, pending, claimed, compounded }) {
    const classes = useStyles();
    const statusRewards = useMemo(
      () =>
        [
          ['compounded', compounded] as const,
          ['claimed', claimed] as const,
          ['pending', pending] as const,
        ]
          .map(([status, wanted]) =>
            !!wanted && rewards[status]?.has
              ? ([status, rewards[status].rewards] as const)
              : undefined
          )
          .filter(isDefined),
      [rewards, pending, claimed, compounded]
    );

    return (
      <div className={classes.statuses}>
        {statusRewards.map(([status, rewards]) => (
          <StatusRewards status={status} rewards={rewards} key={status} />
        ))}
      </div>
    );
  }
);

type StatusRewardsProps = {
  status: UserRewardStatus;
  rewards: UserReward[];
};

const StatusRewards = memo<StatusRewardsProps>(function StatusRewards({ status, rewards }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const grouped = useMemo(() => groupByMap(rewards, r => r.source), [rewards]);
  const getTitle = useMemo(() => {
    const statusText = ucFirstLetter(status);
    return (source: UserRewardSource) => {
      return t([`Dashboard-Rewards-${status}-${source}`, `Dashboard-Rewards-Fallback-${source}`], {
        status: statusText,
      });
    };
  }, [t, status]);

  return (
    <div className={classes.sources}>
      {Array.from(grouped.entries(), ([source, rewards]) => (
        <div className={classes.source} key={source}>
          <div className={classes.sourceTitle}>{getTitle(source)}</div>
          <div className={classes.rewards}>
            {rewards.map(reward => {
              return (
                <div key={`${reward.token.chainId}:${reward.token.address}`}>
                  <div className={classes.rewardsText}>
                    {formatTokenDisplayCondensed(reward.amount, reward.token.decimals)}{' '}
                    {reward.token.symbol}
                  </div>
                  <div className={classes.usdPrice}>{formatLargeUsd(reward.usd)}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});
