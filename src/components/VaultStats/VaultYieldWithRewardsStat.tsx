import type { VaultEntity } from '../../features/data/entities/vault';
import { memo, useMemo } from 'react';
import {
  formatBigUsd,
  formatFullBigNumber,
  formatSignificantBigNumber,
} from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectIsAnalyticsLoaded,
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
import type { VaultPnLDataType } from './types';

const useStyles = makeStyles(styles);

export type VaultYieldStatProps = {
  vaultId: VaultEntity['id'];
  pnlData: VaultPnLDataType;
};

export const VaultYieldWithRewardsStat = memo<VaultYieldStatProps>(
  function VaultYieldWithRewardsStat({ vaultId, pnlData }) {
    const classes = useStyles();
    const vaultTimeline = useAppSelector(state =>
      selectUserDepositedTimelineByVaultId(state, vaultId)
    );

    const isLoaded = useAppSelector(state => selectIsAnalyticsLoaded(state));

    const { rewards } = useAppSelector(state => selectUserRewardsByVaultId(state, vaultId));

    const { totalYield, totalYieldUsd, oraclePrice, tokenDecimals } = pnlData;

    const hasRewards = useMemo(() => {
      return rewards.length !== 0 ? true : false;
    }, [rewards.length]);

    if (!vaultTimeline || !isLoaded) {
      return (
        <VaultValueStat
          label="VaultStat-Yield"
          showLabel={false}
          value={'-'}
          loading={isLoaded ? true : false}
        />
      );
    }

    return (
      <VaultValueStat
        label="VaultStat-Yield"
        value={
          <div className={classes.flexEnd}>
            <Tooltip
              content={
                <BasicTooltipContent title={formatFullBigNumber(totalYield, tokenDecimals)} />
              }
              triggerClass={clsx(classes.textGreen, classes.textOverflow, classes.maxWidth80, {
                [classes.maxWidth60]: hasRewards,
              })}
            >
              {formatSignificantBigNumber(totalYield, tokenDecimals, oraclePrice, 0, 2)}
            </Tooltip>
            {hasRewards && (
              <>
                <div>+</div>
                <RewardsTooltip vaultId={vaultId} />
              </>
            )}
          </div>
        }
        subValue={formatBigUsd(totalYieldUsd)}
        showLabel={false}
        loading={false}
      />
    );
  }
);
