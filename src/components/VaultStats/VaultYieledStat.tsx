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
import { BoostTooltipRewards } from '../BoostTooltipRewards/BoostTooltipRewards';

export type VaultYieledStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
};

export const VaultYieledStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId, className }: VaultYieledStatProps) {
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

  const { totalYield, totalYieldUsd, oraclePrice, tokenDecimals } = selectVaultPnl(state, vaultId);

  return {
    label,
    value: (
      <>
        <VaultValueStat
          className={className ?? ''}
          label="-"
          loading={!isLoaded}
          showLabel={false}
          value={formatSignificantBigNumber(totalYield, tokenDecimals, oraclePrice, 0, 2)}
          tooltip={<BasicTooltipContent title={formatFullBigNumber(totalYield, tokenDecimals)} />}
        />
        <BoostTooltipRewards vaultId={vaultId} />
      </>
    ),
    subValue: formatBigUsd(totalYieldUsd),
    blur: false,
    loading: !isLoaded,
    boosted: false,
    className: className ?? '',
  };
}
