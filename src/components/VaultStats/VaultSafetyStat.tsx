import { VaultEntity } from '../../features/data/entities/vault';
import React, { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { VaultValueStat } from '../../features/home/components/Vault/components/VaultValueStat';
import { SafetyScore, SafetyScoreProps } from '../SafetyScore';
import { useMediaQuery } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';

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

type StatSafetyScoreProps = { score: SafetyScoreProps['score'] };
const StatSafetyScore = memo<StatSafetyScoreProps>(function SafetyTooltip({ score }) {
  const alignRight = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  return <SafetyScore score={score} size="sm" align={alignRight ? 'right' : 'left'} />;
});
