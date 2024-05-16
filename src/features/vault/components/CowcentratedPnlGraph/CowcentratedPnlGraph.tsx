import { memo, useMemo, useState } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';

import { Card, CardTitle, CardHeader, CardContent } from '../Card';
import { useTranslation } from 'react-i18next';
import { StatSwitcher } from '../StatSwitcher';
import { styles } from './styles';
import { makeStyles, useMediaQuery, type Theme } from '@material-ui/core';
import { RangeSwitcher } from '../HistoricGraph/RangeSwitcher';
import type { TimeRange } from '../HistoricGraph/utils';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { formatDateTimeTick } from '../PnLGraph/components/Graph/helpers';
import { GraphHeader } from './components/GraphHeader';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectHasBreakdownDataByTokenAddress } from '../../../data/selectors/tokens';
import { selectIsAddressBookLoaded } from '../../../data/selectors/data-loader';
import { selectHasDataToShowGraphByVaultId } from '../../../data/selectors/analytics';

const useStyles = makeStyles(styles);

interface CowcentratedPnlGraphProps {
  vaultId: VaultEntity['id'];
  address?: string;
}

export const CowcentratedPnlGraphLoader = memo<CowcentratedPnlGraphProps>(
  function CowcentratedPnlGraphLoader({ vaultId, address }) {
    const vault = useAppSelector(state => selectVaultById(state, vaultId));

    const haveBreakdownData = useAppSelector(state =>
      selectHasBreakdownDataByTokenAddress(state, vault.depositTokenAddress, vault.chainId)
    );
    const hasData = useAppSelector(state =>
      selectHasDataToShowGraphByVaultId(state, vaultId, address)
    );

    const chainId = vault.chainId;
    const isAddressBookLoaded = useAppSelector(state => selectIsAddressBookLoaded(state, chainId));

    if (haveBreakdownData && isAddressBookLoaded && hasData) {
      return <CowcentratedPnlGraph vaultId={vaultId} address={address} />;
    }

    return null;
  }
);

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

  return (
    <Card className={classes.card}>
      <CardHeader className={classes.header}>
        <CardTitle title={t('Graph-PositionPerformance')} />
        <StatSwitcher stat={stat} options={options} onChange={setStat} />
      </CardHeader>
      <CardContent className={classes.content}>
        <GraphHeader vaultId={vaultId} />
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
  { v: 1, t: 17564645, ma: 1290, token0: 400, token1: 900 },
  { v: 5, t: 17564647, ma: 1500, token0: 750, token1: 800 },
  { v: 5, t: 17564648, ma: 1300, token0: 800, token1: 500 },
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
          <Area dataKey="ma" stroke="#5C70D6" strokeWidth={1.5} fill="none" />{' '}
          <YAxis mirror={true} stroke="#363B63" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
