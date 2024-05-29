import {
  isCowcentratedVault,
  isGovVault,
  isStandardVault,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultGov,
  type VaultStandard,
} from '../../features/data/entities/vault';
import { memo } from 'react';
import type { BeefyState } from '../../redux-types';
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
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import {
  isUserClmPnl,
  isUserGovPnl,
  isUserStandardPnl,
  type UserClmPnl,
  type UserGovPnl,
  type UserStandardPnl,
  type UserVaultPnl,
} from '../../features/data/selectors/analytics-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsUserBalanceAvailable } from '../../features/data/selectors/data-loader';
import { selectUserRewardsByVaultId } from '../../features/data/selectors/balance';
import { RewardsTooltip } from '../RewardsTooltip/RewardsTooltip';
import { useAppSelector } from '../../store';
import { Tooltip } from '../Tooltip';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { selectCowcentratedVaultDepositTokens } from '../../features/data/selectors/tokens';
import { pick } from 'lodash-es';
import { CowcentratedCompoundedTooltipContent } from '../CowcentratedCompoundedTooltipContent/CowcentratedCompoundedTooltipContent';

const useStyles = makeStyles(styles);

export type VaultYieldStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  pnlData: UserVaultPnl;
  walletAddress: string;
};

enum DataStatus {
  Loading,
  Missing,
  Available,
}

function selectGovVaultData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultGov,
  _pnl: UserGovPnl
) {
  const { totalRewardsUsd } = selectUserRewardsByVaultId(state, vault.id, walletAddress);
  return { type: vault.type, totalRewardsUsd };
}

function selectStandardVaultData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultStandard,
  pnl: UserStandardPnl
) {
  if (!selectIsAnalyticsLoadedByAddress(state, walletAddress)) {
    return DataStatus.Loading;
  }

  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vault.id, walletAddress);
  if (!vaultTimeline) {
    return DataStatus.Missing;
  }

  const { rewards } = selectUserRewardsByVaultId(state, vault.id, walletAddress);
  const { totalYield, totalYieldUsd, tokenDecimals } = pnl;
  return {
    type: vault.type,
    hasRewards: rewards.length > 0,
    totalYield,
    totalYieldUsd,
    tokenDecimals,
  };
}

function selectCowcentratedVaultData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultCowcentrated,
  pnl: UserClmPnl
) {
  if (!selectIsAnalyticsLoadedByAddress(state, walletAddress)) {
    return DataStatus.Loading;
  }

  const { rewards } = selectUserRewardsByVaultId(state, vault.id, walletAddress);
  const tokens = selectCowcentratedVaultDepositTokens(state, vault.id);
  return {
    type: vault.type,
    ...tokens,
    ...pick(pnl, [
      'total0Compounded',
      'total1Compounded',
      'total0CompoundedUsd',
      'total1CompoundedUsd',
      'totalCompoundedUsd',
    ]),
    hasRewards: rewards.length > 0,
  };
}

function selectVaultData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultEntity,
  pnl: UserVaultPnl
) {
  // Common load check
  if (!selectIsUserBalanceAvailable(state, walletAddress)) {
    return DataStatus.Loading;
  }

  if (isGovVault(vault) && isUserGovPnl(pnl)) {
    return selectGovVaultData(state, walletAddress, vault, pnl);
  } else if (isStandardVault(vault) && isUserStandardPnl(pnl)) {
    return selectStandardVaultData(state, walletAddress, vault, pnl);
  } else if (isCowcentratedVault(vault) && isUserClmPnl(pnl)) {
    return selectCowcentratedVaultData(state, walletAddress, vault, pnl);
  }

  throw new Error('Invalid vault/pnl type');
}

export const VaultYieldRewardsStat = memo<VaultYieldStatProps>(function VaultYieldRewardsStat({
  vaultId,
  className,
  pnlData,
  walletAddress,
}) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const label = isGovVault(vault) ? 'VaultStat-Claimable-Rewards' : 'VaultStat-Yield';
  const data = useAppSelector(state => selectVaultData(state, walletAddress, vault, pnlData));

  if (data === DataStatus.Loading) {
    return <VaultValueStat label={label} value="-" loading={true} className={className} />;
  }

  if (data === DataStatus.Missing) {
    return <VaultValueStat label={label} value="?" loading={false} className={className} />;
  }

  if (data.type === 'gov') {
    const { totalRewardsUsd } = data;
    return (
      <VaultValueStat
        label={label}
        value={<RewardsTooltip size={20} vaultId={vaultId} walletAddress={walletAddress} />}
        subValue={formatLargeUsd(totalRewardsUsd)}
        loading={false}
        className={className}
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
        className={className}
      />
    );
  }

  if (data.type === 'cowcentrated') {
    const { hasRewards, totalCompoundedUsd, ...tooltipProps } = data;

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
        className={className}
      />
    );
  }

  return <VaultValueStat label={label} value="?" loading={false} className={className} />;
});
