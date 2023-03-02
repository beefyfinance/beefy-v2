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
import { max } from 'lodash';

const TIME_BUCKET: TimeBucketType[] = ['1h_1d', '1h_1w', '1d_1M', '1d_all'];

// 2 HOURS - 1 DAY - 1 WEEK- 2 WEEK
const X_DOMAIN_SECONDS = [7200, 86400, 604800, 604800 * 2];

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

  const underlyingDiff = useMemo(() => {
    return domainOffSet(minUnderlying, maxUnderlying, 0.88);
  }, [maxUnderlying, minUnderlying]);

  const usdDiff = useMemo(() => {
    return domainOffSet(minUsd, maxUsd, 0.88);
  }, [maxUsd, minUsd]);

  const startUnderlyingDomain = useMemo(() => {
    return max([0, minUnderlying - underlyingDiff]);
  }, [minUnderlying, underlyingDiff]);

  const startUsdDomain = useMemo(() => {
    return max([0, minUsd - usdDiff]);
  }, [minUsd, usdDiff]);

  const underlyingTicks = useMemo(() => {
    return mapRangeToTicks(startUnderlyingDomain, maxUnderlying + underlyingDiff);
  }, [maxUnderlying, startUnderlyingDomain, underlyingDiff]);

  const usdTicks = useMemo(() => {
    return mapRangeToTicks(startUsdDomain, maxUsd + usdDiff);
  }, [maxUsd, startUsdDomain, usdDiff]);

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'));

  const padding = useMemo(() => {
    return smDown ? 16 : 24;
  }, [smDown]);

  const yMirror = useMemo(() => {
    return smDown ? true : false;
  }, [smDown]);

  const dateTicks = useMemo(() => {
    if (data.length > 0) {
      let ticks = [];
      let lastDate = null;
      for (const row of data) {
        const date = new Date(row.datetime);
        if (lastDate === null || date.getTime() - lastDate.getTime() >= X_DOMAIN_SECONDS[stat]) {
          ticks.push(row.datetime);
          lastDate = date;
        }
      }
      return ticks;
    }
    return [0];
  }, [data, stat]);

  if (loading) {
    return <Loader />;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        width={450}
        height={200}
        data={data}
        margin={{ top: 14, right: padding, bottom: 0, left: padding }}
      >
        <CartesianGrid strokeDasharray="1 1" stroke="#363B63" />
        <Line
          yAxisId="underliying"
          strokeWidth={1.5}
          dataKey="underlyingBalance"
          stroke="#59A662"
          dot={false}
          type="linear"
        />
        <Line
          yAxisId="usd"
          strokeWidth={1.5}
          dataKey="usdBalance"
          stroke="#5C99D6"
          dot={false}
          type="linear"
        />
        <XAxis
          tickFormatter={tickitem => formatXAxis(tickitem, TIME_BUCKET[stat])}
          dataKey="datetime"
          allowDuplicatedCategory={false}
          padding={{ left: 2, right: 2 }}
          tickMargin={10}
          ticks={dateTicks}
          scale="time"
          type="number"
          stroke="#363B63"
          domain={[data[0].datetime, data[data.length - 1].datetime]}
        />
        <YAxis
          stroke="#59A662"
          strokeWidth={1.5}
          tickFormatter={tickItem =>
            formatFullBigNumber(new BigNumber(tickItem), tickItem > 999 ? 0 : 3)
          }
          yAxisId="underliying"
          domain={[startUnderlyingDomain, maxUnderlying + underlyingDiff]}
          ticks={underlyingTicks}
          mirror={yMirror}
        />
        <YAxis
          stroke="#5C99D6"
          orientation="right"
          strokeWidth={1.5}
          tickFormatter={tickItem => formatBigUsd(new BigNumber(tickItem))}
          yAxisId="usd"
          domain={[startUsdDomain, maxUsd + usdDiff]}
          ticks={usdTicks}
          mirror={yMirror}
        />

        <Tooltip wrapperStyle={{ outline: 'none' }} content={<PnLTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
});

function formatXAxis(tickItem: number, timebucket: TimeBucketType) {
  if (timebucket === '1h_1d') {
    return format(tickItem, 'HH:mm');
  }
  return format(tickItem, 'dd/MM');
}

const domainOffSet = (min: number, max: number, heightPercentageUsedByChart: number) => {
  return ((max - min) * (1 - heightPercentageUsedByChart)) / (2 * heightPercentageUsedByChart);
};

const mapRangeToTicks = (min: number, max: number) => {
  const factors = [0, 0.25, 0.5, 0.75, 1];
  return factors.map(f => min + f * (max - min));
};
