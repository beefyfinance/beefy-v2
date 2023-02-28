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
import { max } from 'lodash';

const TIME_BUCKET: TimeBucketType[] = ['1h_1d', '1h_1w', '1d_1M', '1d_1Y'];

export const Graph = memo(function ({ vaultId, stat }: { vaultId: string; stat: number }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const productKey = useMemo(() => {
    return `beefy:vault:${vault.chainId}:${vault.earnContractAddress.toLowerCase()}`;
  }, [vault.chainId, vault.earnContractAddress]);

  const { data, minUnderlying, maxUnderlying, minUsd, maxUsd, loading, error } = usePnLChartData(
    TIME_BUCKET[stat],
    productKey,
    vaultId
  );

  const underlyingDiff = domainOffSet(minUnderlying, maxUnderlying, 0.88);
  const usdDiff = domainOffSet(minUsd, maxUsd, 0.88);

  const startUnderliyingDomain = useMemo(() => {
    return max([0, minUnderlying - underlyingDiff]);
  }, [minUnderlying, underlyingDiff]);

  const startUsdDomain = useMemo(() => {
    return max([0, minUsd - usdDiff]);
  }, [minUsd, usdDiff]);

  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const padding = useMemo(() => {
    return mdDown ? 16 : 24;
  }, [mdDown]);

  if (loading) {
    return <Loader />;
  }

  if (error.error) {
    return <NoData status={error.status} message={error.message} />;
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
          tickFormatter={tickitem => formatXAxis(tickitem, TIME_BUCKET[stat])}
          dataKey="datetime"
          allowDuplicatedCategory={false}
          padding={{ left: 2, right: 2 }}
          tickMargin={8}
        />
        <YAxis
          stroke="#59A662"
          strokeWidth={1.5}
          tickFormatter={tickItem =>
            formatFullBigNumber(new BigNumber(tickItem), tickItem > 999 ? 0 : 3)
          }
          yAxisId="underliying"
          domain={[startUnderliyingDomain, maxUnderlying + underlyingDiff]}
        />
        <YAxis
          stroke="#5C99D6"
          orientation="right"
          strokeWidth={1.5}
          tickFormatter={tickItem => formatBigUsd(new BigNumber(tickItem))}
          yAxisId="usd"
          domain={[startUsdDomain, maxUsd + usdDiff]}
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
    return format(tickItem, 'HH:mm');
  }
  return format(tickItem, 'dd/MM');
}

const domainOffSet = (min: number, max: number, heightPercentageUsedByChart: number) => {
  return ((max - min) * (1 - heightPercentageUsedByChart)) / (2 * heightPercentageUsedByChart);
};
