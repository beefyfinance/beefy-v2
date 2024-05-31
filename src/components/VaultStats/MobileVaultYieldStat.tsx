import { isGovVault, type VaultEntity } from '../../features/data/entities/vault';
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
import { selectVaultById } from '../../features/data/selectors/vaults';
import { useAppSelector } from '../../store';
import { CowcentratedCompoundedTooltipContent } from '../CowcentratedCompoundedTooltipContent/CowcentratedCompoundedTooltipContent';
import type { UserVaultPnl } from '../../features/data/selectors/analytics-types';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';

export type MobileVaultYieldStatProps = {
  vaultId: VaultEntity['id'];
  pnlData: UserVaultPnl;
  walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

export const MobileVaultYieldStat = memo<MobileVaultYieldStatProps>(function MobileVaultYieldStat({
  vaultId,
  pnlData,
  walletAddress,
  ...passthrough
}) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const label = 'VaultStat-Yield';
  const data = useAppSelector(state =>
    selectDashboardYieldVaultData(state, walletAddress, vault, pnlData)
  );

  if (isGovVault(vault)) {
    return null;
  }

  if (data === DashboardDataStatus.Loading) {
    return <VaultValueStat label={label} value="-" loading={true} {...passthrough} />;
  }

  if (data === DashboardDataStatus.Missing) {
    return <VaultValueStat label={label} value="?" loading={false} {...passthrough} />;
  }

  if (data.type === 'standard') {
    const { totalYield, totalYieldUsd, tokenDecimals } = data;
    return (
      <VaultValueStat
        label={label}
        value={formatTokenDisplayCondensed(totalYield, tokenDecimals)}
        subValue={formatLargeUsd(totalYieldUsd)}
        tooltip={<BasicTooltipContent title={formatTokenDisplay(totalYield, tokenDecimals)} />}
        loading={false}
        {...passthrough}
      />
    );
  }

  if (data.type === 'cowcentrated') {
    const { type: _type, hasRewards: _hasRewards, totalCompoundedUsd, ...tooltipProps } = data;

    return (
      <VaultValueStat
        label={label}
        value={formatLargeUsd(totalCompoundedUsd)}
        tooltip={<CowcentratedCompoundedTooltipContent {...tooltipProps} />}
        loading={false}
        {...passthrough}
      />
    );
  }

  return null;
});
