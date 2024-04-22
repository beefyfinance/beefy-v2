import React, { memo, useMemo, useState } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';

import { Card, CardTitle, CardHeader, CardContent } from '../Card';
import { useTranslation } from 'react-i18next';
import { StatSwitcher } from '../StatSwitcher';
import { styles } from './styles';
import { makeStyles, useMediaQuery, type Theme } from '@material-ui/core';
import { Stat } from './components/Stat';
import { RangeSwitcher } from '../HistoricGraph/RangeSwitcher';
import type { TimeRange } from '../HistoricGraph/utils';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { formatDateTimeTick } from '../PnLGraph/components/Graph/helpers';

const useStyles = makeStyles(styles);

interface CowcentratedPnlGraphProps {
  _vaultId: VaultEntity['id'];
}

export const CowcentratedPnlGraph = memo<CowcentratedPnlGraphProps>(function CowcentratedPnlGraph({
  _vaultId,
}) {
  const [stat, setStat] = useState<string>('Overview');
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader className={classes.header}>
        <CardTitle title={t('Graph-PositionPerformance')} />
        <StatSwitcher
          stat={stat}
          availableStats={['Overview', 'Fees']}
          onChange={setStat}
          type={'cowcentrated'}
        />
      </CardHeader>

      <CardContent className={classes.content}>
        <div className={classes.statsContainer}>
          <Stat
            label={'At Deposit'}
            value0={'1.2432 WBTC'}
            value1={'22.34 ETH '}
            value2="1.11 LP"
            subValue0="$555"
            subValue1="$444"
            subValue2="$1"
          />
          <Stat
            label={'Now'}
            value0={'1.2432 WBTC'}
            value1={'22.34 ETH '}
            value2="1.11 LP"
            subValue0="$555"
            subValue1="$444"
            subValue2="$1"
          />
          <Stat
            label={'Change'}
            value0={'+0.05 WBTC'}
            value1={'+1.3 ETH'}
            value2="-$432 PNL"
            value2ClassName={classes.red}
          />
        </div>
        <DummyGraph />
        <div className={classes.footer}>
          <div>- Position Value</div>
          <RangeSwitcher
            availableRanges={['1Day', '1Year']}
            range={'1Day'}
            onChange={(newBucket: TimeRange) => {
              console.log(newBucket);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
});

const data = [
  { v: 1, t: 17564645, ma: 1 },
  { v: 5, t: 17564647, ma: 4 },
];

const DummyGraph = memo(function DummyGraph() {
  const classes = useStyles();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), { noSsr: true });
  const chartMargin = useMemo(() => {
    return { top: 14, right: isMobile ? 16 : 24, bottom: 0, left: isMobile ? 16 : 24 };
  }, [isMobile]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const xTickFormatter = useMemo(() => {
    return (value: number) => formatDateTimeTick(value, '1h_1d');
  }, []);
  return (
    <div className={classes.graphContainer}>
      <ResponsiveContainer height={200}>
        <AreaChart data={data} className={classes.graph} height={200} margin={chartMargin}>
          <CartesianGrid strokeDasharray="2 2" stroke="#363B63" />
          <XAxis
            tickFormatter={xTickFormatter}
            dataKey="t"
            tickMargin={10}
            stroke="#363B63"
            padding="no-gap"
          />

          <Area dataKey="ma" stroke="#5C70D6" strokeWidth={1.5} fill="none" />

          <YAxis dataKey="v" mirror={true} stroke="#363B63" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
