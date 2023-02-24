import React, { memo, useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { usePnLChartData } from '../../hooks';
import { format } from 'date-fns';
import { formatBigUsd, formatFullBigNumber } from '../../../../../../helpers/format';
import BigNumber from 'bignumber.js';
import { PnLTooltip } from '../PnLTooltip';
import { TimeBucketType } from '../../../../../data/apis/analytics/analytics-types';
import { Theme, useMediaQuery } from '@material-ui/core';
import { Loader } from '../Loader';
import { NoData } from '../NoData';

const TIME_BUCKET: TimeBucketType[] = ['1h_1d', '1h_1w', '1d_1M', '1d_1Y'];

export const Graph = memo(function ({ vaultId, stat }: { vaultId: string; stat: number }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const productKey = useMemo(() => {
    return `beefy:vault:${vault.chainId}:${vault.earnContractAddress.toLowerCase()}`;
  }, [vault.chainId, vault.earnContractAddress]);

  const { data, minUnderlying, maxUnderlying, minUsd, maxUsd, loading } = usePnLChartData(
    TIME_BUCKET[stat],
    productKey,
    vaultId
  );

  const underlyingDiff = domainOffSet(minUnderlying, maxUnderlying, 0.88);
  const usdDiff = domainOffSet(minUsd, maxUsd, 0.88);

  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const padding = useMemo(() => {
    return mdDown ? 16 : 24;
  }, [mdDown]);

  const ticksXAxis = useMemo(() => {
    if (TIME_BUCKET[stat] === '1h_1d') {
      return data.map(row => row.datetime.getTime()).filter((row, i) => i % 2 === 0);
    }
    return data.map(row => row.datetime.getTime()).filter((row, i) => i % 7 === 0);
  }, [data, stat]);

  if (loading) {
    return <Loader />;
  }

  if (!loading && data.length === 0) {
    return <NoData />;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        width={450}
        height={200}
        data={data}
        margin={{ top: 0, right: padding, bottom: 0, left: padding }}
      >
        <CartesianGrid strokeDasharray="1 1" stroke="#363B63" />
        <XAxis
          allowDataOverflow={true}
          type="number"
          tickFormatter={tickitem => formatXAxis(tickitem, TIME_BUCKET[stat])}
          dataKey="datetime"
          allowDuplicatedCategory={false}
          ticks={ticksXAxis}
          domain={[ticksXAxis[0], ticksXAxis[ticksXAxis.length - 1]]}
          padding={{ left: 2, right: 2 }}
          dy={6}
        />
        <YAxis
          stroke="#59A662"
          strokeWidth={1.5}
          tickFormatter={tickItem =>
            formatFullBigNumber(new BigNumber(tickItem), tickItem > 999 ? 0 : 3)
          }
          yAxisId="underliying"
          domain={[minUnderlying - underlyingDiff, maxUnderlying + underlyingDiff]}
        />
        <YAxis
          stroke="#5C99D6"
          orientation="right"
          strokeWidth={1.5}
          tickFormatter={tickItem => formatBigUsd(new BigNumber(tickItem))}
          yAxisId="usd"
          domain={[minUsd - usdDiff, maxUsd + usdDiff]}
        />
        <Line
          yAxisId="underliying"
          strokeWidth={1.5}
          dataKey="underlyingBalance"
          stroke="#59A662"
          dot={false}
          type="basis"
        />
        <Line
          type="basis"
          yAxisId="usd"
          strokeWidth={1.5}
          dataKey="usdBalance"
          stroke="#5C99D6"
          dot={false}
        />
        <Tooltip wrapperStyle={{ outline: 'none' }} content={<PnLTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
});

function formatXAxis(tickItem: number, timebucket: TimeBucketType) {
  if (timebucket === '1h_1d') {
    return format(tickItem * 1000, 'HH:mm');
  }
  return format(tickItem * 1000, 'dd/MM');
}

const domainOffSet = (min: number, max: number, heightPercentageUsedByChart: number) => {
  return ((max - min) * (1 - heightPercentageUsedByChart)) / (2 * heightPercentageUsedByChart);
};
