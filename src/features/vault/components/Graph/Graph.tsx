import { makeStyles, Box } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

import { Card } from '../Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { CustomTooltip } from './CustomTooltip';
import { useChartData } from './useChartData';
import { Tabs } from '../../../../components/Tabs';
import { BasicTabs } from '../../../../components/Tabs/BasicTabs';
import { formatUsd, formatApy } from '../../../../helpers/format';
import { styles } from './styles';
interface GraphProps {
  oracleId: any;
  vaultId: any;
  network: any;
}
const useStyles = makeStyles(styles as any);
function GraphComponent({ oracleId, vaultId, network }: GraphProps) {
  const classes = useStyles();
  const [stat, setStat] = useState(2);
  const [period, setPeriod] = useState(2);
  const chartData = useChartData(stat, period, oracleId, vaultId, network);
  const t = useTranslation().t;

  return (
    <Card>
      <CardHeader>
        <div className={classes.titleBox}>
          <CardTitle title={t('Graph-RateHist')} />
          <div className={classes.headerTabs}>
            <div className={classes.headerTab}>
              <Tabs
                labels={[t('TVL'), t('Graph-Price'), t('APY')]}
                value={stat}
                onChange={newValue => setStat(newValue)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Box style={{ height: 250 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#484D73" />
              <YAxis
                dataKey="v"
                tick={{
                  fill: 'white',
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={label => {
                  return (stat === 2 ? formatApy(label) : formatUsd(label)) as any;
                }}
                tickCount={4}
                width={50}
              />
              <Tooltip content={<CustomTooltip stat={stat} />} />
              <Area
                dataKey="v"
                stroke="#F5F5FF"
                strokeWidth={4}
                fill="rgba(245, 245, 255, 0.1)"
                fillOpacity={100}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
        <div className={classes.footerTab}>
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
