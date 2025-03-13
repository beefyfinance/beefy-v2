import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { memo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';
import type { SafetyScoreProps } from '../SafetyScore/SafetyScore.tsx';
import { SafetyScore } from '../SafetyScore/SafetyScore.tsx';
import { useBreakpoint } from '../MediaQueries/useBreakpoint.ts';

export type VaultSafetyStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultSafetyStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultSafetyStatProps) {
  const label = 'VaultStat-SAFETY';
  const vault = selectVaultById(state, vaultId);

  return {
    label,
    value: <StatSafetyScore score={vault.safetyScore} />,
    subValue: null,
    blur: false,
    loading: false,
  };
}

type StatSafetyScoreProps = {
  score: SafetyScoreProps['score'];
};
const StatSafetyScore = memo(function SafetyTooltip({ score }: StatSafetyScoreProps) {
  const alignRight = useBreakpoint({ from: 'lg' });
  return <SafetyScore score={score} size="sm" align={alignRight ? 'right' : 'left'} />;
});
