import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { memo, type ReactNode } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types.ts';
import {
  formatLargeUsd,
  formatTokenDisplay,
  formatTokenDisplayCondensed,
} from '../../helpers/format.ts';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';
import {
  selectIsAnalyticsLoadedByAddress,
  selectUserDepositedTimelineByVaultId,
} from '../../features/data/selectors/analytics.ts';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent.tsx';
import { isUserClmPnl, type UserVaultPnl } from '../../features/data/selectors/analytics-types.ts';
import { type CssStyles } from '@repo/styles/css';

export type VaultAtDepositStatProps = {
  vaultId: VaultEntity['id'];
  css?: CssStyles;
  pnlData: UserVaultPnl;
  walletAddress: string;
};

export const VaultAtDepositStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(
  state: BeefyState,
  { vaultId, css: cssProp, pnlData, walletAddress }: VaultAtDepositStatProps
) {
  const label = 'VaultStat-AtDeposit';
  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);
  const isLoaded = selectIsAnalyticsLoadedByAddress(state, walletAddress);

  if (!vaultTimeline || !vaultTimeline.current.length) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: false,
      css: cssProp,
    };
  }

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
      css: cssProp,
    };
  }

  let value: string, subValue: string, tooltip: ReactNode;
  if (isUserClmPnl(pnlData)) {
    value = formatTokenDisplayCondensed(
      pnlData.underlying.entry.amount,
      pnlData.underlying.token.decimals,
      6
    );
    subValue = formatLargeUsd(pnlData.underlying.entry.usd);
    tooltip = (
      <BasicTooltipContent
        title={formatTokenDisplay(
          pnlData.underlying.entry.amount,
          pnlData.underlying.token.decimals
        )}
      />
    );
  } else {
    const { balanceAtDeposit, usdBalanceAtDeposit, tokenDecimals } = pnlData;
    value = formatTokenDisplayCondensed(balanceAtDeposit, tokenDecimals, 6);
    subValue = formatLargeUsd(usdBalanceAtDeposit);
    tooltip = <BasicTooltipContent title={formatTokenDisplay(balanceAtDeposit, tokenDecimals)} />;
  }

  return {
    label,
    value,
    subValue,
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip,
    css: cssProp,
  };
}
