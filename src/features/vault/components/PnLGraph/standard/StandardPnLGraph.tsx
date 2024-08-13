import { makeStyles } from '@material-ui/core';
import { memo, useCallback, useMemo, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../Card';
import { useTranslation } from 'react-i18next';
import { StatSwitcher } from '../../StatSwitcher';

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
  const { t } = useTranslation();
  const [stat, setStat] = useState<'overview'>('overview');
  const classes = useStyles();
  const labels = useVaultPeriods(vaultId, address);
  const [period, setPeriod] = useState<number>(labels.length - 1);
  const canShowGraph = labels.length > 0;

  const options = useMemo(() => {
    return {
      overview: t('Graph-Overview'),
    };
  }, [t]);

  return (
    <Card className={classes.card}>
      <CardHeader className={classes.header}>
        <CardTitle title={t('Graph-PositionPerformance')} />
        {Object.keys(options).length > 1 ? (
          <StatSwitcher stat={stat} options={options} onChange={setStat as (v: string) => void} />
        ) : null}
      </CardHeader>
      <CardContent className={classes.content}>
        <Header vaultId={vaultId} />
        <div className={classes.graphContainer}>
          {canShowGraph ? (
            <Graph vaultId={vaultId} period={period} address={address} />
          ) : (
            <GraphNoData reason="wait-collect" />
          )}
        </div>
        {canShowGraph ? (
          <Footer labels={labels} vaultId={vaultId} period={period} handlePeriod={setPeriod} />
        ) : null}
      </CardContent>
    </Card>
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
