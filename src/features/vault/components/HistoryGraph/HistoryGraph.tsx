import { makeStyles } from '@material-ui/core';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardTitle } from '../Card/CardTitle';
import { useChartData } from './useChartData';
import { Tabs } from '../../../../components/Tabs';
import { styles } from './styles';
import { shouldVaultShowInterest, VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';
import { useMemo } from 'react';
import { Footer } from './components/Footer';
import { Graph } from './components/Graph';

const useStyles = makeStyles(styles);

export interface AverageState {
  simpleAverage: boolean;
  movingAverage: boolean;
}

function GraphComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const showApy = shouldVaultShowInterest(vault);
  const classes = useStyles();
  const [stat, setStat] = useState(showApy ? 2 : 0);
  const [period, setPeriod] = useState(3);
  const [showAverages, setShowAverages] = useState<AverageState>({
    simpleAverage: true,
    movingAverage: true,
  });
  const tokenOracleId = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  ).oracleId;
  const { chartData, movingAverageDetail } = useChartData(
    stat,
    period,
    tokenOracleId,
    vaultId,
    vault.chainId
  );

  const { t } = useTranslation();
  const tabs = useMemo(() => {
    const labels = [t('TVL'), t('Graph-Price')];
    if (showApy) {
      labels.push(t('APY'));
    }
    return labels;
  }, [t, showApy]);

  const handleShowAverages = useCallback(
    (e: boolean, average: string) => {
      const newState = { ...showAverages, [average]: e };
      setShowAverages(newState);
    },
    [showAverages]
  );

  const handlePeriod = useCallback((newPeriod: number) => {
    setPeriod(newPeriod);
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.titleBox}>
          <CardTitle title={t('Graph-RateHist')} />
          <div className={classes.headerTabs}>
            <Tabs labels={tabs} value={stat} onChange={newValue => setStat(newValue)} />
          </div>
        </div>
      </div>

      <Graph
        chartData={chartData}
        movingAverageDetail={movingAverageDetail}
        period={period}
        stat={stat}
        showAverages={showAverages}
      />

      <Footer
        period={period}
        handlePeriod={handlePeriod}
        averageLines={showAverages}
        handleAverageLines={handleShowAverages}
      />
    </div>
  );
}

export const HistoryGraph = React.memo(GraphComponent);
