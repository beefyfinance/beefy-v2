import { type FC, memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '../../../../../components/ErrorBoundary/ErrorBoundary.tsx';
import { GraphNoData } from '../../../../../components/GraphNoData/GraphNoData.tsx';
import type { ToggleButtonItem } from '../../../../../components/ToggleButtons/ToggleButtons.tsx';
import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../data/store/hooks.ts';
import {
  fetchClmHarvestsForUserVault,
  fetchClmPendingRewards,
} from '../../../../data/actions/analytics.ts';
import { isCowcentratedStandardVault, type VaultEntity } from '../../../../data/entities/vault.ts';
import {
  selectClmAutocompoundedFeesEnabledByVaultId,
  selectHasDataToShowGraphByVaultId,
} from '../../../../data/selectors/analytics.ts';
import { selectIsContractDataLoadedOnChain } from '../../../../data/selectors/contract-data.ts';
import {
  selectHasBreakdownDataForVaultId,
  selectIsAddressBookLoaded,
} from '../../../../data/selectors/tokens.ts';
import { selectCowcentratedLikeVaultById } from '../../../../data/selectors/vaults.ts';
import { selectWalletAddress } from '../../../../data/selectors/wallet.ts';
import { Card } from '../../Card/Card.tsx';
import { CardContent } from '../../Card/CardContent.tsx';
import { CardHeader } from '../../Card/CardHeader.tsx';
import { CardTitle } from '../../Card/CardTitle.tsx';
import { StatSwitcher } from '../../StatSwitcher/StatSwitcher.tsx';
import { CLMFeesGraph } from './components/FeesGraph/FeesGraph.tsx';
import { useVaultPeriodsFeesGraph } from './components/FeesGraph/hooks.ts';
import { FeesGraphHeader } from './components/FeesGraphHeader/FeesGraphHeader.tsx';
import { FeesFooter, OverviewFooter } from './components/Footers/Footer.tsx';
import { useVaultPeriodsOverviewGraph } from './components/OverviewGraph/hooks.ts';
import { CLMOverviewGraph } from './components/OverviewGraph/OverviewGraph.tsx';
import { OverviewGraphHeader } from './components/OverviewGraphHeader/OverviewGraphHeader.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface CowcentratedPnlGraphLoaderProps {
  vaultId: VaultEntity['id'];
  address?: string;
}

export const CowcentratedPnlGraphLoader = memo(function CowcentratedPnlGraphLoader({
  vaultId,
  address,
}: CowcentratedPnlGraphLoaderProps) {
  const walletAddress = useAppSelector(state => address || selectWalletAddress(state));
  const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));

  const haveBreakdownData = useAppSelector(state =>
    selectHasBreakdownDataForVaultId(state, vaultId)
  );
  const isContractDataLoaded = useAppSelector(state =>
    selectIsContractDataLoadedOnChain(state, vault.chainId)
  );
  const hasData = useAppSelector(state =>
    selectHasDataToShowGraphByVaultId(state, vaultId, walletAddress)
  );
  const isAddressBookLoaded = useAppSelector(state =>
    selectIsAddressBookLoaded(state, vault.chainId)
  );

  if (
    haveBreakdownData &&
    isAddressBookLoaded &&
    hasData &&
    isContractDataLoaded &&
    walletAddress
  ) {
    return <CowcentratedPnlGraph vaultId={vaultId} address={walletAddress} />;
  }

  return null;
});

interface CowcentratedPnlGraphProps {
  vaultId: VaultEntity['id'];
  address: string;
}

export const OverviewGraph = memo(function OverviewGraph({
  vaultId,
  address,
}: CowcentratedPnlGraphProps) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));
  const labels = useVaultPeriodsOverviewGraph(vaultId, address);
  const [period, setPeriod] = useState<number>(labels.length - 1);
  const canShowGraph = labels.length > 0;

  return (
    <CardContent css={styles.content}>
      <OverviewGraphHeader vaultId={vaultId} />
      <div className={classes.graphContainer}>
        {canShowGraph ?
          <ErrorBoundary>
            <CLMOverviewGraph period={period} address={address} vaultId={vaultId} />
          </ErrorBoundary>
        : <GraphNoData reason="wait-collect" />}
      </div>
      {canShowGraph ?
        <OverviewFooter
          labels={labels}
          period={period}
          handlePeriod={setPeriod}
          position={isCowcentratedStandardVault(vault)}
        />
      : null}
    </CardContent>
  );
});

export const FeesGraph = memo(function FeesGraph({ vaultId, address }: CowcentratedPnlGraphProps) {
  const classes = useStyles();
  const labels = useVaultPeriodsFeesGraph(vaultId, address);
  const [period, setPeriod] = useState<number>(labels.length - 1);
  const canShowGraph = labels.length > 0;

  return (
    <CardContent css={styles.content}>
      <FeesGraphHeader vaultId={vaultId} address={address} />
      <div className={classes.graphContainer}>
        {canShowGraph ?
          <CLMFeesGraph vaultId={vaultId} period={period} address={address} />
        : <GraphNoData reason="wait-collect" />}
      </div>
      {canShowGraph ?
        <FeesFooter labels={labels} vaultId={vaultId} period={period} handlePeriod={setPeriod} />
      : null}
    </CardContent>
  );
});

const chartToComponent = {
  overview: OverviewGraph,
  fees: FeesGraph,
} as const satisfies Record<string, FC<CowcentratedPnlGraphProps>>;

type ChartType = keyof typeof chartToComponent;

export const CowcentratedPnlGraph = memo(function CowcentratedPnlGraph({
  vaultId,
  address,
}: CowcentratedPnlGraphProps) {
  const dispatch = useAppDispatch();
  const [stat, setStat] = useState<ChartType>('overview');
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));
  const fetchCompounds = vault.strategyTypeId === 'compounds';
  const showCompounds = useAppSelector(state =>
    selectClmAutocompoundedFeesEnabledByVaultId(state, vaultId)
  );

  useEffect(() => {
    if (fetchCompounds) {
      dispatch(fetchClmHarvestsForUserVault({ vaultId, walletAddress: address }));
      dispatch(fetchClmPendingRewards({ vaultId }));
    }
  }, [dispatch, vaultId, address, fetchCompounds]);

  const options = useMemo(() => {
    const opts: Array<ToggleButtonItem<ChartType>> = [
      { value: 'overview', label: t('Graph-Overview') },
    ];
    if (showCompounds) {
      opts.push({ value: 'fees', label: t('Graph-Fees') });
    }
    return opts;
  }, [t, showCompounds]);

  const GraphComponent = chartToComponent[stat];

  return (
    <Card css={styles.card}>
      <CardHeader>
        <CardTitle>{t('Graph-PositionPerformance')}</CardTitle>
        {Object.keys(options).length > 1 ?
          <StatSwitcher<ChartType> stat={stat} options={options} onChange={setStat} />
        : null}
      </CardHeader>
      <ErrorBoundary>
        <GraphComponent vaultId={vaultId} address={address} />
      </ErrorBoundary>
    </Card>
  );
});

export const DashboardOverviewGraph = memo(function DashboardOverviewGraph({
  vaultId,
  address,
}: CowcentratedPnlGraphProps) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));
  const labels = useVaultPeriodsOverviewGraph(vaultId, address);
  const [period, setPeriod] = useState<number>(labels.length - 1);
  const canShowGraph = labels.length > 0;

  return (
    <div className={classes.dashboardPnlContainer}>
      {canShowGraph ?
        <>
          <CLMOverviewGraph address={address} period={period} vaultId={vaultId} />
          <OverviewFooter
            css={styles.footerDashboard}
            labels={labels}
            period={period}
            handlePeriod={setPeriod}
            position={isCowcentratedStandardVault(vault)}
          />
        </>
      : <GraphNoData reason="wait-collect" />}
    </div>
  );
});

export const DashboardFeesGraph = memo(function DashboardFeesGraph({
  vaultId,
  address,
}: CowcentratedPnlGraphProps) {
  const classes = useStyles();
  const labels = useVaultPeriodsFeesGraph(vaultId, address);
  const [period, setPeriod] = useState<number>(labels.length - 1);
  const canShowGraph = labels.length > 0;

  return (
    <div className={classes.dashboardPnlContainer}>
      {canShowGraph ?
        <>
          <CLMFeesGraph address={address} period={period} vaultId={vaultId} />
          <FeesFooter
            css={styles.footerDashboard}
            labels={labels}
            vaultId={vaultId}
            period={period}
            handlePeriod={setPeriod}
          />
        </>
      : <GraphNoData reason="wait-collect" />}
    </div>
  );
});
