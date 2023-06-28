import { makeStyles } from '@material-ui/core';
import React, { memo, useCallback } from 'react';
import { useAppSelector } from '../../../../store';
import type { VaultEntity } from '../../../data/entities/vault';
import { selectHasDataToShowGraphByVaultId } from '../../../data/selectors/analytics';
import { Footer } from './components/Footer';
import { Graph } from './components/Graph';
import { Header } from './components/Header';
import { useVaultPeriods } from './hooks';
import { styles } from './styles';

export const useStyles = makeStyles(styles);

interface PnLGraphProps {
  vaultId: VaultEntity['id'];
  address: string;
}

export const PnLGraphLoader = memo<PnLGraphProps>(function PnLGraphLoader({ vaultId, address }) {
  const hasData = useAppSelector(state =>
    selectHasDataToShowGraphByVaultId(state, vaultId, address)
  );

  if (hasData) {
    return <PnLGraph address={address} vaultId={vaultId} />;
  }
  return null;
});

export const PnLGraph = memo<PnLGraphProps>(function PnLGraph({ vaultId, address }) {
  const classes = useStyles();

  const labels = useVaultPeriods(vaultId, address);

  const [period, setPeriod] = React.useState<number>(labels.length - 1);

  const handlePeriod = useCallback((newPeriod: number) => {
    setPeriod(newPeriod);
  }, []);

  return (
    <div className={classes.pnlContainer}>
      <Header vaultId={vaultId} />
      <Graph address={address} period={period} vaultId={vaultId} />
      <Footer labels={labels} vaultId={vaultId} period={period} handlePeriod={handlePeriod} />
    </div>
  );
});

export const DashboardPnLGraph = memo<PnLGraphProps>(function PnLGraph({ vaultId, address }) {
  const classes = useStyles();

  const labels = useVaultPeriods(vaultId, address);

  const [period, setPeriod] = React.useState<number>(labels.length - 1);

  const handlePeriod = useCallback((newPeriod: number) => {
    setPeriod(newPeriod);
  }, []);

  return (
    <div className={classes.dashboardPnlContainer}>
      <Graph address={address} period={period} vaultId={vaultId} />
      <Footer
        tabsClassName={classes.tabsDashboard}
        labels={labels}
        vaultId={vaultId}
        period={period}
        handlePeriod={handlePeriod}
      />
    </div>
  );
});
