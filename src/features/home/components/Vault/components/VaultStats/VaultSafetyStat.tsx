import { VaultEntity } from '../../../../../data/entities/vault';
import React, { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../../../../../redux-types';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { VaultValueStat } from '../VaultValueStat';
import { SafetyScore, SafetyScoreProps } from '../../../../../../components/SafetyScore';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';

export type VaultSafetyStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultSafetyStat = memo<VaultSafetyStatProps>(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultSafetyStatProps) {
  const label = 'SAFETY-SCORE';
  const vault = selectVaultById(state, vaultId);

  return {
    label,
    value: <StatSafetyScore score={vault.safetyScore} />,
    subValue: null,
    blur: false,
    loading: false,
    tooltip: <SafetyTooltipContent />,
  };
}

type StatSafetyScoreProps = { score: SafetyScoreProps['score'] };
const StatSafetyScore = memo<StatSafetyScoreProps>(function SafetyTooltip({ score }) {
  const alignRight = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  return <SafetyScore score={score} size="sm" align={alignRight ? 'right' : 'left'} />;
});

const SafetyTooltipContent = memo(function SafetyTooltip() {
  const { t } = useTranslation();
  return <BasicTooltipContent title={t('Safety-ScoreWhat')} content={t('Safety-ScoreExpl')} />;
});
