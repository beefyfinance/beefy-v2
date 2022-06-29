import { useState, useEffect } from 'react';
import { getBeefyApi } from '../../../data/apis/instances';
import { config } from '../../../../config/config';
import { max, sum } from 'lodash';

const STATS = ['tvl', 'price', 'apy'];
const PERIODS = ['hour', 'hour', 'day', 'day'];
const LIMITS = [24, 168, 30, 365];
const DAYS_IN_PERIOD = [1, 7, 30, 365];
export const MOVING_AVERAGE_POINTS = [6, 10, 10, 30];
const SNAPSHOT_INTERVAL = parseInt(process.env.SNAPSHOT_INTERVAL) || 15 * 60;

export const useChartData = (stat, period, oracleId, vaultId, network) => {
  const [chartData, setChartData] = useState(null);
  const [averageValue, setAverageValue] = useState(0);

  useEffect(() => {
    const names = [`${vaultId}-${config[network].chainId}`, oracleId, vaultId];
    const to = Math.floor(Date.now() / (SNAPSHOT_INTERVAL * 1000)) * SNAPSHOT_INTERVAL;
    const from = to - (DAYS_IN_PERIOD[period] + MOVING_AVERAGE_POINTS[period]) * 3600 * 24;

    const fetchData = async () => {
      const api = getBeefyApi();

      const data = await api.getChartData(
        STATS[stat],
        names[stat],
        PERIODS[period],
        from,
        to,
        LIMITS[period] + MOVING_AVERAGE_POINTS[period]
      );

      let values = [];

      for (const item of data) {
        values.push(item.v);
      }

      const _averageValue = sum(values) / data.length;

      const movingAverage = calculateMovingAverage(values, MOVING_AVERAGE_POINTS[stat]);

      const _chartData = [];
      for (let i = 0; i < data.length; i++) {
        _chartData.push({ ...data[i], moveAverageValue: movingAverage[i] });
      }
      setAverageValue(_averageValue);
      setChartData(_chartData);
    };

    fetchData();
  }, [stat, period, network, oracleId, vaultId]);

  return [chartData, averageValue];
};

const calculateItemsSum = (data, start, stop) => {
  let sum = 0;
  for (let j = start; j < stop; j++) {
    sum += data[j];
  }
  return sum;
};

const calculateMovingAverage = (data, points) => {
  const steps = data.length;
  const result = [];
  for (let i = 0; i < steps; i++) {
    const maxNumber = max([i - points, 0]);
    const sum = calculateItemsSum(data, maxNumber, i);
    i === 0 ? result.push(data[i]) : result.push(sum / (i - maxNumber));
  }
  return result;
};
