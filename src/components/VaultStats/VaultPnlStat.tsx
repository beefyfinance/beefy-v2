import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { isUserClmPnl, type UserVaultPnl } from '../../features/data/selectors/analytics-types.ts';
import { selectUserHasCurrentDepositTimelineByVaultId } from '../../features/data/selectors/analytics.ts';
import { formatLargePercent, formatLargeUsd } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { ClmPnlTooltipContent } from '../PnlTooltip/ClmPnlTooltipContent.tsx';
import { showClmPnlTooltip } from '../PnlTooltip/helpers.ts';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { useTranslation } from 'react-i18next';
import { selectIsAnalyticsLoadedByAddress } from '../../features/data/selectors/data-loader/analytics.ts';

const LABEL = 'VaultStat-Pnl';

export type VaultDailyStatProps = {
  vaultId: VaultEntity['id'];
  pnlData: UserVaultPnl;
  walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'value' | 'subValue' | 'blur' | 'loading'>;

export const VaultPnlStat = memo(function ({
  vaultId,
  pnlData,
  walletAddress,
  ...passthrough
}: VaultDailyStatProps) {
  const { t } = useTranslation();
  const isLoaded = useAppSelector(state => selectIsAnalyticsLoadedByAddress(state, walletAddress));
  const hasCurrentDeposit = useAppSelector(state =>
    selectUserHasCurrentDepositTimelineByVaultId(state, vaultId, walletAddress)
  );
  const hasValue = isLoaded && hasCurrentDeposit;

  let value = '-';
  let subValue: string | null = null;
  if (hasValue) {
    if (isUserClmPnl(pnlData)) {
      value = formatLargeUsd(pnlData.pnl.withClaimedPending.usd);
      subValue = formatLargePercent(pnlData.pnl.withClaimedPending.percentage);
    } else {
      value = formatLargeUsd(pnlData.totalPnlUsd);
      subValue = formatLargePercent(pnlData.pnlPercentage);
    }
  }

  return (
    <VaultValueStat
      label={t(LABEL)}
      value={value}
      subValue={subValue}
      blur={false}
      loading={!isLoaded}
      tooltip={
        hasValue && showClmPnlTooltip(pnlData) ?
          <ClmPnlTooltipContent userPnl={pnlData} />
        : undefined
      }
      {...passthrough}
    />
  );
});
