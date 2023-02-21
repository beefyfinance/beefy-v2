import React, { memo, useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { usePnLChartData } from '../../hooks';

export const Graph = memo(function ({ vaultId, stat }: { vaultId: string; stat: number }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const productKey = useMemo(() => {
    return `beefy:vault:${vault.chainId}:${vault.earnContractAddress.toLowerCase()}`;
  }, [vault.chainId, vault.earnContractAddress]);

  const data = usePnLChartData(stat, productKey, vaultId);

  if (!data) {
    return <div>Loading</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart width={450} height={200} data={data}>
        <CartesianGrid strokeDasharray="1 1" stroke="#363B63" />
        <YAxis stroke="#3F4474" allowDataOverflow type="number" yAxisId="1" />
        <YAxis stroke="#3F4474" orientation="right" allowDataOverflow type="number" yAxisId="2" />
        <Line
          yAxisId="1"
          strokeWidth={1.5}
          dataKey="underlyingBalance"
          stroke="#59A662"
          animationDuration={300}
          dot={false}
          type={'basis'}
        />
        <Line
          type={'basis'}
          yAxisId="2"
          strokeWidth={1.5}
          dataKey="usdBalance"
          stroke="#6A88C8"
          animationDuration={300}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});
