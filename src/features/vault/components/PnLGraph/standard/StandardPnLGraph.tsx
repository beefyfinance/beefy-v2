import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import { memo, useCallback, useMemo, useState } from 'react';
import { useAppSelector } from '../../../../../store.ts';
import { isStandardVault, type VaultEntity } from '../../../../data/entities/vault.ts';
import { selectHasDataToShowGraphByVaultId } from '../../../../data/selectors/analytics.ts';
import { Footer } from './components/Footer/Footer.tsx';
import { Graph } from './components/Graph/Graph.tsx';
import { Header } from './components/Header/Header.tsx';
import { useVaultPeriods } from './hooks.tsx';
import { styles } from './styles.ts';
import { selectVaultById } from '../../../../data/selectors/vaults.ts';
import { selectWalletAddress } from '../../../../data/selectors/wallet.ts';
import { GraphNoData } from '../../../../../components/GraphNoData/GraphNoData.tsx';
import { Card } from '../../Card/Card.tsx';
import { CardContent } from '../../Card/CardContent.tsx';
import { CardHeader } from '../../Card/CardHeader.tsx';
import { CardTitle } from '../../Card/CardTitle.tsx';
import { useTranslation } from 'react-i18next';
import { StatSwitcher } from '../../StatSwitcher/StatSwitcher.tsx';
import type { ToggleButtonItem } from '../../../../../components/ToggleButtons/ToggleButtons.tsx';

const useStyles = legacyMakeStyles(styles);

interface PnLGraphLoaderProps {
  vaultId: VaultEntity['id'];
  address?: string;
}

export const StandardPnLGraphLoader = memo(function PnLGraphLoader({
  vaultId,
  address,
}: PnLGraphLoaderProps) {
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

type ChartType = 'overview';

export const StandardPnLGraph = memo(function StandardPnLGraph({
  vaultId,
  address,
}: PnLGraphProps) {
  const { t } = useTranslation();
  const [stat, setStat] = useState<ChartType>('overview');
  const classes = useStyles();
  const labels = useVaultPeriods(vaultId, address);
  const [period, setPeriod] = useState<number>(labels.length - 1);
  const canShowGraph = labels.length > 0;
  const options = useMemo<Array<ToggleButtonItem<ChartType>>>(
    () => [{ value: 'overview', label: t('Graph-Overview') }],
    [t]
  );

  return (
    <Card css={styles.card}>
      <CardHeader css={styles.header}>
        <CardTitle>{t('Graph-PositionPerformance')}</CardTitle>
        {options.length > 1 ? (
          <StatSwitcher<ChartType> stat={stat} options={options} onChange={setStat} />
        ) : null}
      </CardHeader>
      <CardContent css={styles.content}>
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

export const DashboardPnLGraph = memo(function DashboardPnLGraph({
  vaultId,
  address,
}: PnLGraphProps) {
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
        css={styles.footerDashboard}
        tabsCss={styles.tabsDashboard}
        labels={labels}
        vaultId={vaultId}
        period={period}
        handlePeriod={handlePeriod}
      />
    </div>
  );
});
