import { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../redux-types';
import {
  formatBigNumber,
  formatFullBigNumber,
  formatSignificantBigNumber,
} from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectIsAnalyticsLoaded,
  selectUserDepositedTimelineByVaultId,
  selectVaultPnl,
} from '../../features/data/selectors/analytics';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';

export type VaultAtDepositStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  triggerClassName?: string;
};

export const VaultAtDepositStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(
  state: BeefyState,
  { vaultId, className, triggerClassName }: VaultAtDepositStatProps
) {
  const label = '-';

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

  const { balanceAtDeposit, usdBalanceAtDeposit, oraclePriceAtDeposit, tokenDecimals } =
    selectVaultPnl(state, vaultId);

  return {
    label,
    value: formatSignificantBigNumber(balanceAtDeposit, tokenDecimals, oraclePriceAtDeposit, 0, 2),
    subValue: formatBigNumber(usdBalanceAtDeposit),
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: <BasicTooltipContent title={formatFullBigNumber(balanceAtDeposit, tokenDecimals)} />,
    className: className ?? '',
    triggerClassName: triggerClassName ?? '',
  };
}
