import { Box, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
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
import { Card } from '../Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { CustomTooltip } from './CustomTooltip';
import { useChartData } from './useChartData';
import { Tabs } from '../../../../components/Tabs';
import { BasicTabs } from '../../../../components/Tabs/BasicTabs';
import { formatPercent, formatUsd } from '../../../../helpers/format';
import { styles } from './styles';
import { shouldVaultShowInterest, VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';
import { LabelledCheckbox } from '../../../../components/LabelledCheckbox';
import { useMemo } from 'react';

const useStyles = makeStyles(styles);

function GraphComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const showApy = shouldVaultShowInterest(vault);
  const classes = useStyles();
  const [stat, setStat] = useState(showApy ? 2 : 0);
  const [period, setPeriod] = useState(1);
  const [showAverages, setShowAverages] = useState({ simpleAverage: true, movingAverage: true });
  const tokenOracleId = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  ).oracleId;
  const [chartData, averageValue, movingAverageDetail] = useChartData(
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

  const handleShowAverages = (e, average) => {
    const newState = { ...showAverages, [average]: e };
    setShowAverages(newState);
  };

  return (
    <Card>
      <CardHeader>
        <div className={classes.titleBox}>
          <CardTitle title={t('Graph-RateHist')} />
          <div className={classes.headerTabs}>
            <Tabs labels={tabs} value={stat} onChange={newValue => setStat(newValue)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer height={250}>
          <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#484D73" />
            <YAxis
              dataKey="v"
              tick={{
                fill: 'white',
                fontSize: 12,
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={label => {
                return (stat === 2 ? formatPercent(label) : formatUsd(label)) as any;
              }}
              tickCount={4}
            />
            <Tooltip
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
        <div className={classes.footerTabs}>
          <Box className={classes.checkboxContainer}>
            <LabelledCheckbox
              labelClass={classes.label}
              checkboxClass={classes.checkbox}
              checked={showAverages.simpleAverage}
              onChange={e => handleShowAverages(e, 'simpleAverage')}
              label={
                <>
                  <Box className={classes.averageLine} />
                  {t('Average')}
                </>
              }
            />
            <LabelledCheckbox
              labelClass={classes.label}
              checkboxClass={classes.checkbox}
              checked={showAverages.movingAverage}
              onChange={e => handleShowAverages(e, 'movingAverage')}
              label={
                <>
                  <Box className={classes.movingAverageLine} />
                  {t('Moving-Average')}
                </>
              }
            />
          </Box>
          <BasicTabs
            labels={[t('Graph-1Day'), t('Graph-1Week'), t('Graph-1Month'), t('Graph-1Year')]}
            value={period}
            onChange={newValue => setPeriod(newValue)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export const Graph = React.memo(GraphComponent);
