import type { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
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
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import type { VaultPnLDataType } from './types';

export type VaultAtDepositStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  pnlData: VaultPnLDataType;
};

export const VaultAtDepositStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(
  state: BeefyState,
  { vaultId, className, pnlData }: VaultAtDepositStatProps
) {
  const label = 'VaultStat-AtDeposit';

  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId);

  const isLoaded = selectIsAnalyticsLoaded(state);

  if (!vaultTimeline) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: false,
      className: className ?? '',
    };
  }
  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
      className: className ?? '',
    };
  }

  const { balanceAtDeposit, usdBalanceAtDeposit, oraclePriceAtDeposit, tokenDecimals } = pnlData;

  return {
    label,
    value: formatSignificantBigNumber(balanceAtDeposit, tokenDecimals, oraclePriceAtDeposit, 0, 2),
    subValue: formatBigUsd(usdBalanceAtDeposit),
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: <BasicTooltipContent title={formatFullBigNumber(balanceAtDeposit, tokenDecimals)} />,
    className: className ?? '',
  };
}
