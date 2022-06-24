import { useState, useEffect } from 'react';
import { getBeefyApi } from '../../../data/apis/instances';
import { config } from '../../../../config/config';

const STATS = ['tvl', 'price', 'apy'];
const PERIODS = ['hour', 'hour', 'day', 'day'];
const LIMITS = [24, 168, 30, 365];
const DAYS_IN_PERIOD = [1, 7, 30, 365];
const SNAPSHOT_INTERVAL = parseInt(process.env.SNAPSHOT_INTERVAL) || 15 * 60;

export const useChartData = (stat, period, oracleId, vaultId, network) => {
  const [chartData, setChartData] = useState(null);
  const [averageValue, setAverageValue] = useState(0);

  useEffect(() => {
    const names = [`${vaultId}-${config[network].chainId}`, oracleId, vaultId];
    const to = Math.floor(Date.now() / (SNAPSHOT_INTERVAL * 1000)) * SNAPSHOT_INTERVAL;
    const from = to - DAYS_IN_PERIOD[period] * 3600 * 24;

    const fetchData = async () => {
      const api = getBeefyApi();

      const data = await api.getChartData(
        STATS[stat],
        names[stat],
        PERIODS[period],
        from,
        to,
        LIMITS[period]
      );

      let totalValue = 0;

      for (const item of data) {
        totalValue += item.v;
      }

      const _averageValue = totalValue / data.length;

      const _chartData = data.map((item: any) => {
        return { ...item, averageValue: _averageValue };
      });

      setAverageValue(_averageValue);
      setChartData(_chartData);
    };

    fetchData();
  }, [stat, period, network, oracleId, vaultId]);

  return [chartData, averageValue];
};
