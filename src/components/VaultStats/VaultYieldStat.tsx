import { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../redux-types';
import {
  formatBigUsd,
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

export type VaultYieldStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
};

export const VaultYieldStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId, className }: VaultYieldStatProps) {
  const label = 'Yield';

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

  const { totalYield, totalYieldUsd, oraclePrice, tokenDecimals } = selectVaultPnl(state, vaultId);

  return {
    label,
    value: formatSignificantBigNumber(totalYield, tokenDecimals, oraclePrice, 0, 2),
    tooltip: <BasicTooltipContent title={formatFullBigNumber(totalYield, tokenDecimals)} />,
    subValue: formatBigUsd(totalYieldUsd),
    blur: false,
    loading: !isLoaded,
    boosted: false,
    className: className ?? '',
  };
}
