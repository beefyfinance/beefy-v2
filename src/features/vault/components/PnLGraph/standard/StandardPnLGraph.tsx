import { makeStyles } from '@material-ui/core';
import { memo, useCallback, useState } from 'react';
import { useAppSelector } from '../../../../../store';
import { isStandardVault, type VaultEntity } from '../../../../data/entities/vault';
import { selectHasDataToShowGraphByVaultId } from '../../../../data/selectors/analytics';
import { Footer } from './components/Footer';
import { Graph } from './components/Graph';
import { Header } from './components/Header';
import { useVaultPeriods } from './hooks';
import { styles } from './styles';
import { selectVaultById } from '../../../../data/selectors/vaults';
import { selectWalletAddress } from '../../../../data/selectors/wallet';
import { GraphNoData } from '../../../../../components/GraphNoData/GraphNoData';

export const useStyles = makeStyles(styles);

interface PnLGraphLoaderProps {
  vaultId: VaultEntity['id'];
  address?: string;
}

export const StandardPnLGraphLoader = memo<PnLGraphLoaderProps>(function PnLGraphLoader({
  vaultId,
  address,
}) {
  const walletAddress = useAppSelector(state => address || selectWalletAddress(state));
  const hasData = useAppSelector(state =>
    selectHasDataToShowGraphByVaultId(state, vaultId, address)
  );
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  // TODO change when clm standard vault data comes from subgraph
  if (hasData && walletAddress && isStandardVault(vault)) {
    return <StandardPnLGraph address={walletAddress} vaultId={vaultId} />;
  }

  return null;
});

interface PnLGraphProps {
  vaultId: VaultEntity['id'];
  address: string;
}

export const StandardPnLGraph = memo<PnLGraphProps>(function StandardPnLGraph({
  vaultId,
  address,
}) {
  const classes = useStyles();
  const labels = useVaultPeriods(vaultId, address);
  const [period, setPeriod] = useState<number>(labels.length - 1);
  const canShowGraph = labels.length > 0;

  return (
    <div className={classes.pnlContainer}>
      <Header vaultId={vaultId} />
      {canShowGraph ? (
        <>
          <Graph address={address} period={period} vaultId={vaultId} />
          <Footer labels={labels} vaultId={vaultId} period={period} handlePeriod={setPeriod} />
        </>
      ) : (
        <GraphNoData reason="wait-collect" />
      )}
    </div>
  );
});

export const DashboardPnLGraph = memo<PnLGraphProps>(function DashboardPnLGraph({
  vaultId,
  address,
}) {
  const classes = useStyles();

  const labels = useVaultPeriods(vaultId, address);

  const [period, setPeriod] = useState<number>(labels.length - 1);

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
