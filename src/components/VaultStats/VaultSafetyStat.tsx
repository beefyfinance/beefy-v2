import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../store.ts';
import { useBreakpoint } from '../MediaQueries/useBreakpoint.ts';
import type { SafetyScoreProps } from '../SafetyScore/SafetyScore.tsx';
import { SafetyScore } from '../SafetyScore/SafetyScore.tsx';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';

export type VaultSafetyStatProps = {
  vaultId: VaultEntity['id'];
} & Omit<VaultValueStatProps, 'label' | 'value'>;

export const VaultSafetyStat = memo(function ({ vaultId, ...passthrough }: VaultSafetyStatProps) {
  const label = 'VaultStat-SAFETY';
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  return (
    <VaultValueStat
      label={label}
      value={<StatSafetyScore score={vault.safetyScore} />}
      {...passthrough}
    />
  );
});

type StatSafetyScoreProps = {
  score: SafetyScoreProps['score'];
};
const StatSafetyScore = memo(function SafetyTooltip({ score }: StatSafetyScoreProps) {
  const alignRight = useBreakpoint({ from: 'lg' });
  return <SafetyScore score={score} size="sm" align={alignRight ? 'right' : 'left'} />;
});
