import { makeStyles } from '@material-ui/core';
import React, { useCallback } from 'react';
import { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { VaultEntity } from '../../../data/entities/vault';
import {
  selectIsAnalyticsLoaded,
  selectUserDepositedTimelineByVaultId,
} from '../../../data/selectors/analytics';
import { selectUserDepositedVaultIds } from '../../../data/selectors/balance';
import { selectVaultById } from '../../../data/selectors/vaults';
import { Footer } from './components/Footer';
import { Graph } from './components/Graph';
import { Header } from './components/Header';
import { useVaultPeriods } from './hooks';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface PnLGraphProps {
  vaultId: VaultEntity['id'];
}

export const PnLGraph = memo<PnLGraphProps>(function ({ vaultId }) {
  const classes = useStyles();

  const userVaults = useAppSelector(selectUserDepositedVaultIds);

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId)
  );

  const isLoaded = useAppSelector(selectIsAnalyticsLoaded);

  const labels = useVaultPeriods(vaultId);

  const [stat, setStat] = React.useState<number>(labels.length - 1);

  const handleStat = useCallback((newStat: number) => {
    setStat(newStat);
  }, []);

  if (
    !isLoaded ||
    !userVaults.includes(vaultId) ||
    vaultTimeline.length === 0 ||
    vault.status !== 'active' ||
    !labels
  ) {
    return null;
  }

  return (
    <div className={classes.pnlContainer}>
      <Header vaultId={vaultId} />
      <div className={classes.graphContainer}>
        <Graph stat={stat} vaultId={vaultId} />
      </div>
      <Footer labels={labels} vaultId={vaultId} stat={stat} handleStat={handleStat} />
    </div>
  );
});
