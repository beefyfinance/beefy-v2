import { makeStyles, Box } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

import Card from '../Card/Card';
import CardHeader from '../Card/CardHeader';
import CardContent from '../Card/CardContent';
import CardTitle from '../Card/CardTitle/CardTitle';
import CustomTooltip from './CustomTooltip';
import useChartData from './useChartData';
import Tabs from 'components/Tabs';
import BasicTabs from 'components/Tabs/BasicTabs';
import { formatUsd, formatApy } from 'helpers/format';
import styles from './styles';

const useStyles = makeStyles(styles);

const Graph = ({ oracleId, vaultId, network }) => {
  const classes = useStyles();
  const [stat, setStat] = useState(2);
  const [period, setPeriod] = useState(2);
  const chartData = useChartData(stat, period, oracleId, vaultId, network);
  const t = useTranslation().t;

  return (
    <Card>
      <CardHeader>
        <div style={{ display: 'flex' }}>
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
                tickFormatter={label => (stat === 2 ? formatApy(label) : formatUsd(label))}
                tickCount={4}
                width={50}
              />
              <Tooltip content={<CustomTooltip stat={stat} />} />
              <Area
                dataKey="v"
                stroke="#6E6399"
                strokeWidth={4}
                fill="rgba(98, 84, 153, 0.13)"
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
};

export default Graph;
