import type { VaultEntity } from '../../features/data/entities/vault';
import { memo, type ReactNode } from 'react';
import {
  formatLargeUsd,
  formatTokenDisplay,
  formatTokenDisplayCondensed,
} from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectIsAnalyticsLoadedByAddress,
  selectUserDepositedTimelineByVaultId,
} from '../../features/data/selectors/analytics';
import { useAppSelector } from '../../store';
import { selectUserRewardsByVaultId } from '../../features/data/selectors/balance';
import { RewardsTooltip } from '../RewardsTooltip/RewardsTooltip';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import { Tooltip } from '../Tooltip';
import { isUserClmPnl, type UserVaultPnl } from '../../features/data/selectors/analytics-types';

const useStyles = makeStyles(styles);

export type VaultYieldStatProps = {
  vaultId: VaultEntity['id'];
  pnlData: UserVaultPnl;
  walletAddress: string;
};

export const VaultYieldWithRewardsStat = memo<VaultYieldStatProps>(
  function VaultYieldWithRewardsStat({ vaultId, pnlData, walletAddress }) {
    const classes = useStyles();
    const vaultTimeline = useAppSelector(state =>
      selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress)
    );
    const isLoaded = useAppSelector(state =>
      selectIsAnalyticsLoadedByAddress(state, walletAddress)
    );
    const { rewards } = useAppSelector(state =>
      selectUserRewardsByVaultId(state, vaultId, walletAddress)
    );
    const hasRewards = rewards.length !== 0;

    if (!vaultTimeline || !isLoaded) {
      return (
        <VaultValueStat label="VaultStat-Yield" showLabel={false} value={'-'} loading={!isLoaded} />
      );
    }

    let value: ReactNode, subValue: string | null;
    if (isUserClmPnl(pnlData)) {
      value = 'N/A';
      subValue = null;
    } else {
      const { totalYield, totalYieldUsd, tokenDecimals } = pnlData;
      value = (
        <div className={classes.flexEnd}>
          <Tooltip
            content={<BasicTooltipContent title={formatTokenDisplay(totalYield, tokenDecimals)} />}
            triggerClass={clsx(classes.textGreen, classes.textOverflow, classes.maxWidth80, {
              [classes.maxWidth60]: hasRewards,
            })}
          >
            {formatTokenDisplayCondensed(totalYield, tokenDecimals)}
          </Tooltip>
          {hasRewards && (
            <>
              <div>+</div>
              <RewardsTooltip walletAddress={walletAddress} vaultId={vaultId} />
            </>
          )}
        </div>
      );
      subValue = formatLargeUsd(totalYieldUsd);
    }

    return (
      <VaultValueStat
        label="VaultStat-Yield"
        value={value}
        subValue={subValue}
        showLabel={false}
        loading={false}
      />
    );
  }
);
