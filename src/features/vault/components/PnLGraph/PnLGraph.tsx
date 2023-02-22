import { makeStyles } from '@material-ui/core';
import React, { useCallback } from 'react';
import { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { VaultEntity } from '../../../data/entities/vault';
import { selectIsAnalyticsLoaded } from '../../../data/selectors/analytics';
import { selectUserDepositedVaultIds } from '../../../data/selectors/balance';
import { selectVaultById } from '../../../data/selectors/vaults';
import { Footer } from './components/Footer';
import { Graph } from './components/Graph';
import { Header } from './components/Header';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface PnLGraphProps {
  vaultId: VaultEntity['id'];
}

export const PnLGraph = memo<PnLGraphProps>(function ({ vaultId }) {
  const classes = useStyles();

  const userVaults = useAppSelector(selectUserDepositedVaultIds);

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const isLoaded = useAppSelector(selectIsAnalyticsLoaded);

  const [stat, setStat] = React.useState<number>(1);

  const handleStat = useCallback((newStat: number) => {
    setStat(newStat);
  }, []);

  if (!isLoaded || !userVaults.includes(vaultId) || vault.status !== 'active') {
    return null;
  }

  return (
    <div className={classes.pnlContainer}>
      <Header vaultId={vaultId} />
      <div className={classes.graphContainer}>
        <Graph stat={stat} vaultId={vaultId} />
      </div>
      <Footer vaultId={vaultId} stat={stat} handleStat={handleStat} />
    </div>
  );
});
