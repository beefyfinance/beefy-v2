import { makeStyles, Theme, useMediaQuery } from '@material-ui/core';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';
import { CardTitle } from '../Card/CardTitle';
import { CustomTooltip } from './components/CustomTooltip';
import { useChartData } from './useChartData';
import { Tabs } from '../../../../components/Tabs';
import { formatPercent, formatUsd } from '../../../../helpers/format';
import { styles } from './styles';
import { shouldVaultShowInterest, VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';
import { useMemo } from 'react';
import { Footer } from './components/Footer';
import { max } from 'lodash';

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
  const [period, setPeriod] = useState(1);
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

  const { data, averageValue, minValue, maxValue } = chartData;
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

  const valueDiff = useMemo(() => {
    return domainOffSet(minValue, maxValue, 0.88);
  }, [maxValue, minValue]);

  const startValueDomain = useMemo(() => {
    return max([0, minValue - valueDiff]);
  }, [minValue, valueDiff]);

  const ticks = useMemo(() => {
    return mapRangeToTicks(startValueDomain, maxValue + valueDiff);
  }, [maxValue, startValueDomain, valueDiff]);

  const handlePeriod = useCallback((newPeriod: number) => {
    setPeriod(newPeriod);
  }, []);

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'));

  const padding = useMemo(() => {
    return smDown ? 16 : 24;
  }, [smDown]);

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
      <div className={classes.graphContainer}>
        <ResponsiveContainer height={200}>
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: padding }}>
            <CartesianGrid vertical={false} stroke="#484D73" />
            <YAxis
              dataKey="v"
              tickFormatter={label => {
                return (stat === 2 ? formatPercent(label) : formatUsd(label)) as any;
              }}
              domain={[startValueDomain, maxValue + valueDiff]}
              ticks={ticks}
            />
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              content={
                <CustomTooltip
                  stat={stat}
                  averageValue={averageValue}
                  movingAverageDetail={movingAverageDetail}
                  showSimpleAverage={showAverages.simpleAverage}
                  showMovingAverage={showAverages.movingAverage}
                />
              }
            />
            <Area
              dataKey="v"
              stroke="#F5F5FF"
              strokeWidth={2}
              fill="rgba(245, 245, 255, 0.1)"
              fillOpacity={100}
            />
            {showAverages.movingAverage && (
              <Area dataKey="moveAverageValue" stroke="#4F93C4" strokeWidth={2} fill="none" />
            )}
            {showAverages.simpleAverage && (
              <ReferenceLine y={averageValue} stroke="#59A662" strokeDasharray="3 3" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <Footer
        period={period}
        handlePeriod={handlePeriod}
        averageLines={showAverages}
        handleAverageLines={handleShowAverages}
      />
    </div>
  );
}

export const Graph = React.memo(GraphComponent);

export const domainOffSet = (min: number, max: number, heightPercentageUsedByChart: number) => {
  return ((max - min) * (1 - heightPercentageUsedByChart)) / (2 * heightPercentageUsedByChart);
};

export const mapRangeToTicks = (min: number, max: number) => {
  const factors = [0, 0.25, 0.5, 0.75, 1];
  return factors.map(f => min + f * (max - min));
};
