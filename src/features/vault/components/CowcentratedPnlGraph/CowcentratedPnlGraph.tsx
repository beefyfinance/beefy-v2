import { type FC, memo, useEffect, useMemo, useState } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { useTranslation } from 'react-i18next';
import { StatSwitcher } from '../StatSwitcher';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { OverviewGraphHeader } from './components/OverviewGraphHeader';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectHasBreakdownDataByTokenAddress } from '../../../data/selectors/tokens';
import {
  selectIsAddressBookLoaded,
  selectIsContractDataLoadedOnChain,
} from '../../../data/selectors/data-loader';
import { selectHasDataToShowGraphByVaultId } from '../../../data/selectors/analytics';
import { CLMOverviewGraph } from './components/OverviewGraph';
import { useVaultPeriods } from './components/OverviewGraph/hooks';
import { FeesFooter, OverviewFooter } from './components/Footers';
import { FeesGraphHeader } from './components/FeesGraphHeader';
import {
  fetchClmHarvestsForUserVault,
  fetchClmPendingRewards,
} from '../../../data/actions/analytics';
import { selectWalletAddress } from '../../../data/selectors/wallet';
import { CLMFeesGraph } from './components/FeesGraph';

const useStyles = makeStyles(styles);

interface CowcentratedPnlGraphLoaderProps {
  vaultId: VaultEntity['id'];
  address?: string;
}

export const CowcentratedPnlGraphLoader = memo<CowcentratedPnlGraphLoaderProps>(
  function CowcentratedPnlGraphLoader({ vaultId, address }) {
    const walletAddress = useAppSelector(state => address || selectWalletAddress(state));
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const haveBreakdownData = useAppSelector(state =>
      selectHasBreakdownDataByTokenAddress(state, vault.depositTokenAddress, vault.chainId)
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
  }
);

enum ChartEnum {
  Overview = 1,
  Fees,
}

interface CowcentratedPnlGraphProps {
  vaultId: VaultEntity['id'];
  address: string;
}

export const OverviewGraph = memo<CowcentratedPnlGraphProps>(function OverviewGraph({
  vaultId,
  address,
}) {
  const classes = useStyles();
  const labels = useVaultPeriods(vaultId, address);
  const [period, setPeriod] = useState<number>(labels.length - 1);

  return (
    <>
      <CardContent className={classes.content}>
        <OverviewGraphHeader vaultId={vaultId} />
        <div className={classes.graphContainer}>
          <CLMOverviewGraph period={period} address={address} vaultId={vaultId} />
        </div>
        <OverviewFooter labels={labels} period={period} handlePeriod={setPeriod} />
      </CardContent>
    </>
  );
});

export const FeesGraph = memo<CowcentratedPnlGraphProps>(function FeesGraph({ vaultId, address }) {
  const classes = useStyles();
  const labels = useVaultPeriods(vaultId, address);
  const [period, setPeriod] = useState<number>(labels.length - 1);

  return (
    <>
      <CardContent className={classes.content}>
        <FeesGraphHeader vaultId={vaultId} address={address} />
        <div className={classes.graphContainer}>
          <CLMFeesGraph vaultId={vaultId} period={period} address={address} />
        </div>
        <FeesFooter labels={labels} vaultId={vaultId} period={period} handlePeriod={setPeriod} />
      </CardContent>
    </>
  );
});

const chartToComponent: Record<ChartEnum, FC<CowcentratedPnlGraphProps>> = {
  [ChartEnum.Overview]: OverviewGraph as FC<CowcentratedPnlGraphProps>,
  [ChartEnum.Fees]: FeesGraph as FC<CowcentratedPnlGraphProps>,
};

export const CowcentratedPnlGraph = memo<CowcentratedPnlGraphProps>(function CowcentratedPnlGraph({
  vaultId,
  address,
}) {
  const dispatch = useAppDispatch();
  const [stat, setStat] = useState<string>('Overview');
  const { t } = useTranslation();
  const classes = useStyles();

  useEffect(() => {
    dispatch(fetchClmHarvestsForUserVault({ vaultId, walletAddress: address }));
    dispatch(fetchClmPendingRewards({ vaultId }));
  }, [dispatch, vaultId, address]);

  const options = useMemo(() => {
    return {
      Overview: t('Graph-Overview'),
      Fees: t('Graph-Fees'),
    };
  }, [t]);

  const chartStat = useMemo(() => {
    if (stat === 'Overview') {
      return ChartEnum.Overview;
    } else {
      return ChartEnum.Fees;
    }
  }, [stat]);

  const GraphComponent = chartToComponent[chartStat];

  return (
    <Card className={classes.card}>
      <CardHeader className={classes.header}>
        <CardTitle title={t('Graph-PositionPerformance')} />
        <StatSwitcher stat={stat} options={options} onChange={setStat} />
      </CardHeader>
      <GraphComponent vaultId={vaultId} address={address} />
    </Card>
  );
});

export const DashboardCowcentratedPnLGraph = memo<CowcentratedPnlGraphProps>(
  function DashboardCowcentratedPnLGraph({ vaultId, address }) {
    const classes = useStyles();
    const labels = useVaultPeriods(vaultId, address);
    const [period, setPeriod] = useState<number>(labels.length - 1);

    return (
      <div className={classes.dashboardPnlContainer}>
        <CLMOverviewGraph address={address} period={period} vaultId={vaultId} />
        <OverviewFooter
          tabsClassName={classes.tabsDashboard}
          labels={labels}
          period={period}
          handlePeriod={setPeriod}
        />
      </div>
    );
  }
);
