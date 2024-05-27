import React, { memo, useEffect, useMemo, useState, type FC } from 'react';
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
import { selectIsAddressBookLoaded } from '../../../data/selectors/data-loader';
import { selectHasDataToShowGraphByVaultId } from '../../../data/selectors/analytics';
import { CLMOverviewGraph } from './components/OverviewGraph';
import { useVaultPeriods } from './components/OverviewGraph/hooks';
import { Footer } from './components/Footer';
import { fetchClmHarvests, fetchClmPendingRewards } from '../../../data/actions/clm-harvests';
import { FeesGraphHeader } from './components/FeesGraphHeader';

const useStyles = makeStyles(styles);

interface CowcentratedPnlGraphProps {
  vaultId: VaultEntity['id'];
  address?: string;
}

export const CowcentratedPnlGraphLoader = memo<CowcentratedPnlGraphProps>(
  function CowcentratedPnlGraphLoader({ vaultId, address }) {
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const dispatch = useAppDispatch();

    const haveBreakdownData = useAppSelector(state =>
      selectHasBreakdownDataByTokenAddress(state, vault.depositTokenAddress, vault.chainId)
    );
    const hasData = useAppSelector(state =>
      selectHasDataToShowGraphByVaultId(state, vaultId, address)
    );

    const chainId = vault.chainId;
    const isAddressBookLoaded = useAppSelector(state => selectIsAddressBookLoaded(state, chainId));

    useEffect(() => {
      dispatch(fetchClmHarvests({ vaultId }));
      dispatch(fetchClmPendingRewards({ vaultId }));
    }, [dispatch, vaultId]);

    if (haveBreakdownData && isAddressBookLoaded && hasData) {
      return <CowcentratedPnlGraph vaultId={vaultId} address={address} />;
    }

    return null;
  }
);

enum ChartEnum {
  Overview = 1,
  Fees,
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
        <Footer labels={labels} vaultId={vaultId} period={period} handlePeriod={setPeriod} />
      </CardContent>
    </>
  );
});

export const FeesGraph = memo<CowcentratedPnlGraphProps>(function FeesGraph({ vaultId }) {
  const classes = useStyles();

  return (
    <>
      <CardContent className={classes.content}>
        <FeesGraphHeader vaultId={vaultId} />
        <div className={classes.graphContainer}></div>
      </CardContent>
    </>
  );
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const chartToComponent: Record<ChartEnum, FC<CowcentratedPnlGraphProps>> = {
  [ChartEnum.Overview]: OverviewGraph as FC<CowcentratedPnlGraphProps>,
  [ChartEnum.Fees]: FeesGraph as FC<CowcentratedPnlGraphProps>,
};

export const CowcentratedPnlGraph = memo<CowcentratedPnlGraphProps>(function CowcentratedPnlGraph({
  vaultId,
}) {
  const [stat, setStat] = useState<string>('Overview');
  const { t } = useTranslation();
  const classes = useStyles();

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
      <GraphComponent vaultId={vaultId} />
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
        <Footer
          tabsClassName={classes.tabsDashboard}
          labels={labels}
          vaultId={vaultId}
          period={period}
          handlePeriod={setPeriod}
        />
      </div>
    );
  }
);
