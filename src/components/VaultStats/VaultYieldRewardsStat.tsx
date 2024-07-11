import {
  isCowcentratedLikeVault,
  isGovVault,
  type VaultEntity,
} from '../../features/data/entities/vault';
import { memo } from 'react';
import {
  formatLargeUsd,
  formatTokenDisplay,
  formatTokenDisplayCondensed,
} from '../../helpers/format';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat';
import {
  DashboardDataStatus,
  selectDashboardYieldVaultData,
} from '../../features/data/selectors/analytics';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import { type UserVaultPnl } from '../../features/data/selectors/analytics-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { RewardsTooltip } from '../RewardsTooltip/RewardsTooltip';
import { useAppSelector } from '../../store';
import { Tooltip } from '../Tooltip';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { CowcentratedCompoundedTooltipContent } from '../CowcentratedCompoundedTooltipContent/CowcentratedCompoundedTooltipContent';

const useStyles = makeStyles(styles);

export type VaultYieldRewardsStatProps = {
  vaultId: VaultEntity['id'];
  pnlData: UserVaultPnl;
  walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

export const VaultYieldRewardsStat = memo<VaultYieldRewardsStatProps>(
  function VaultYieldRewardsStat({ vaultId, pnlData, walletAddress, ...passthrough }) {
    const classes = useStyles();
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const label = isGovVault(vault) ? 'VaultStat-Claimable-Rewards' : 'VaultStat-Yield';
    const data = useAppSelector(state =>
      selectDashboardYieldVaultData(state, walletAddress, vault, pnlData)
    );

    if (data === DashboardDataStatus.Loading) {
      return <VaultValueStat label={label} value="-" loading={true} {...passthrough} />;
    }

    if (data === DashboardDataStatus.Missing) {
      return <VaultValueStat label={label} value="?" loading={false} {...passthrough} />;
    }

    if (data.type === 'gov') {
      const { totalRewardsUsd } = data;
      return (
        <VaultValueStat
          label={label}
          value={<RewardsTooltip size={20} vaultId={vaultId} walletAddress={walletAddress} />}
          subValue={formatLargeUsd(totalRewardsUsd)}
          loading={false}
          {...passthrough}
        />
      );
    }

    if (data.type === 'standard') {
      const { hasRewards, totalYield, totalYieldUsd, tokenDecimals } = data;
      return (
        <VaultValueStat
          label={label}
          value={
            <div className={classes.flexEnd}>
              <Tooltip
                content={
                  <BasicTooltipContent title={formatTokenDisplay(totalYield, tokenDecimals)} />
                }
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
          }
          subValue={formatLargeUsd(totalYieldUsd)}
          loading={false}
          {...passthrough}
        />
      );
    }

    if (data.type === 'cowcentrated') {
      const { hasRewards, totalCompoundedUsd, ...tooltipProps } = data;

      // Only claimable -> show like a normal gov vault
      if (isCowcentratedLikeVault(vault) && vault.strategyTypeId !== 'compounds') {
        return (
          <VaultValueStat
            label={label}
            value={<RewardsTooltip size={20} vaultId={vaultId} walletAddress={walletAddress} />}
            subValue={formatLargeUsd(tooltipProps.totalRewardsUsd)}
            loading={false}
            {...passthrough}
          />
        );
      }

      // Compounds and maybe claimable
      return (
        <VaultValueStat
          label={label}
          value={
            <div className={classes.flexEnd}>
              <Tooltip
                content={<CowcentratedCompoundedTooltipContent {...tooltipProps} />}
                triggerClass={clsx(classes.textGreen, classes.textOverflow, classes.maxWidth80, {
                  [classes.maxWidth60]: hasRewards,
                })}
              >
                {formatLargeUsd(totalCompoundedUsd)}
              </Tooltip>
              {hasRewards && (
                <>
                  <div>+</div>
                  <RewardsTooltip walletAddress={walletAddress} vaultId={vaultId} />
                </>
              )}
            </div>
          }
          loading={false}
          {...passthrough}
        />
      );
    }

    return <VaultValueStat label={label} value="?" loading={false} {...passthrough} />;
  }
);
