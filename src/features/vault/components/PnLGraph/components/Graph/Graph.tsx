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

const TIME_BUCKET: TimeBucketType[] = ['1h_1d', '1h_1w', '1d_1M', '1d_1Y'];

export const Graph = memo(function ({ vaultId, stat }: { vaultId: string; stat: number }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const productKey = useMemo(() => {
    return `beefy:vault:${vault.chainId}:${vault.earnContractAddress.toLowerCase()}`;
  }, [vault.chainId, vault.earnContractAddress]);

  const { data, minUnderlying, maxUnderlying, minUsd, maxUsd, firstDate, lastDate } =
    usePnLChartData(TIME_BUCKET[stat], productKey, vaultId);

  const underlyingDiff = domainOffSet(minUnderlying, maxUnderlying, 0.88);
  const usdDiff = domainOffSet(minUsd, maxUsd, 0.88);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        width={450}
        height={200}
        data={data}
        margin={{ top: 0, right: 32, bottom: 0, left: 32 }}
      >
        <CartesianGrid strokeDasharray="1 1" stroke="#363B63" />
        <XAxis
          allowDataOverflow={true}
          type="number"
          tickFormatter={tickitem => formatXAxis(tickitem, TIME_BUCKET[stat])}
          dataKey="datetime"
          domain={[firstDate.getTime(), lastDate.getTime()]}
          padding={{ left: 2, right: 2 }}
        />
        <YAxis
          stroke="#3F4474"
          tickFormatter={tickItem =>
            formatFullBigNumber(new BigNumber(tickItem), tickItem > 9999 ? 0 : 3)
          }
          yAxisId="underliying"
          domain={[minUnderlying - underlyingDiff, maxUnderlying + underlyingDiff]}
        />
        <YAxis
          stroke="#3F4474"
          orientation="right"
          tickFormatter={tickItem => formatBigUsd(new BigNumber(tickItem))}
          yAxisId="usd"
          domain={[minUsd - usdDiff, maxUsd + usdDiff]}
        />
        <Line
          yAxisId="underliying"
          strokeWidth={1}
          dataKey="underlyingBalance"
          stroke="#59A662"
          dot={false}
          type="basis"
        />
        <Line
          type="basis"
          yAxisId="usd"
          strokeWidth={1}
          dataKey="usdBalance"
          stroke="#6A88C8"
          dot={false}
        />
        <Tooltip wrapperStyle={{ outline: 'none' }} content={<PnLTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
});

function formatXAxis(tickItem: Date, timebucket: TimeBucketType) {
  if (timebucket === '1h_1d') {
    return format(tickItem, 'H:m');
  }
  return format(tickItem, 'dd/M');
}

const domainOffSet = (min: number, max: number, heightPercentageUsedByChart: number) => {
  return ((max - min) * (1 - heightPercentageUsedByChart)) / (2 * heightPercentageUsedByChart);
};
