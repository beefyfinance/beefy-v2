import type { VaultEntity } from '../../features/data/entities/vault';
import React, { memo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { VaultValueStat } from '../VaultValueStat';
import type { SafetyScoreProps } from '../SafetyScore';
import { SafetyScore } from '../SafetyScore';
import { makeStyles } from '@material-ui/core';
import type { Theme } from '@material-ui/core';

export type VaultSafetyStatProps = {
  vaultId: VaultEntity['id'];
};

const useStyles = makeStyles((theme: Theme) => ({
  lgUpFlexEnd: {
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'flex-end',
    },
  },
}));

export const VaultSafetyStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultSafetyStatProps) {
  const label = 'VaultStat-SAFETY';
  const vault = selectVaultById(state, vaultId);

  const isLoaded = state.ui.dataLoader.global.vaults.alreadyLoadedOnce;

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
    };
  }

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
  const classes = useStyles();
  return <SafetyScore score={score} size="sm" className={classes.lgUpFlexEnd} />;
});
