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
import { formatBigDecimals, formatBigUsd } from '../../../../../../helpers/format';
import BigNumber from 'bignumber.js';
import { PnLTooltip } from '../PnLTooltip';

export const Graph = memo(function ({ vaultId, stat }: { vaultId: string; stat: number }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const productKey = useMemo(() => {
    return `beefy:vault:${vault.chainId}:${vault.earnContractAddress.toLowerCase()}`;
  }, [vault.chainId, vault.earnContractAddress]);

  const { data, minUnderlying, maxUnderlying, minUsd, maxUsd } = usePnLChartData(
    stat,
    productKey,
    vaultId
  );

  if (!data) {
    return <div>Loading</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        width={450}
        height={200}
        data={data}
        margin={{ top: 0, right: 24, bottom: 0, left: 24 }}
      >
        <CartesianGrid strokeDasharray="1 1" stroke="#363B63" />
        <XAxis scale="time" tickFormatter={formatXAxis} dataKey="datetime" interval="preserveEnd" />
        <YAxis
          stroke="#3F4474"
          tickFormatter={tickItem => formatBigDecimals(new BigNumber(tickItem), 4)}
          yAxisId="underliying"
          domain={[minUnderlying * 0.995, maxUnderlying * 1.05]}
        />
        <YAxis
          stroke="#3F4474"
          orientation="right"
          tickFormatter={tickItem => formatBigUsd(new BigNumber(tickItem))}
          yAxisId="usd"
          domain={[minUsd * 0.9, maxUsd * 1.1]}
        />
        <Line
          yAxisId="underliying"
          strokeWidth={1}
          dataKey="underlyingBalance"
          stroke="#59A662"
          dot={false}
          type="natural"
        />
        <Line
          type="natural"
          yAxisId="usd"
          strokeWidth={1}
          dataKey="usdBalance"
          stroke="#6A88C8"
          dot={false}
        />
        <Tooltip content={<PnLTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
});

function formatXAxis(tickItem: Date) {
  return format(tickItem, 'dd/M');
}
