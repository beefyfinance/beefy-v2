import { useState, useEffect } from 'react';
import { getBeefyApi } from '../../../data/apis/instances';
import { config } from '../../../../config/config';
import { max, maxBy, minBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { BeefyChartDataResponse } from '../../../data/apis/beefy';

const STATS = ['tvl', 'price', 'apy'];
const PERIODS = ['hour', 'hour', 'day', 'day'];
const LIMITS = [24, 168, 30, 365];
const DAYS_IN_PERIOD = [1, 7, 30, 365];
const MOVING_AVERAGE_POINTS = [6, 48, 10, 30];
const SNAPSHOT_INTERVAL = parseInt(process.env.SNAPSHOT_INTERVAL) || 15 * 60;

interface ChartDataState {
  data: ChartData;
  averageValue: number;
  minValue: number;
  maxValue: number;
}

export const useChartData = (stat, period, oracleId, vaultId, network) => {
  const [chartData, setChartData] = useState<ChartDataState>({
    data: [],
    averageValue: 0,
    minValue: 0,
    maxValue: 0,
  });

  const [movingAverageDetail, setMovingAverageDetail] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const names = [`${vaultId}-${config[network].chainId}`, oracleId, vaultId];
    const to = Math.floor(Date.now() / (SNAPSHOT_INTERVAL * 1000)) * SNAPSHOT_INTERVAL;

    let extraMovingAverageDays = MOVING_AVERAGE_POINTS[period];

    if (PERIODS[period] === 'hour') extraMovingAverageDays /= 24;

    const from = to - Math.floor((DAYS_IN_PERIOD[period] + extraMovingAverageDays) * 3600 * 24);

    setMovingAverageDetail(
      PERIODS[period] === 'hour'
        ? `(${MOVING_AVERAGE_POINTS[period]} ${t('Hours')})`
        : `(${MOVING_AVERAGE_POINTS[period]} ${t('Days')})`
    );

    const maxRequestedPoints = LIMITS[period] + MOVING_AVERAGE_POINTS[period];

    const fetchData = async () => {
      const api = getBeefyApi();

      const data = await api.getChartData(
        STATS[stat],
        names[stat],
        PERIODS[period],
        from,
        to,
        maxRequestedPoints
      );

      const { chartableData, average } = getChartableData(
        data,
        MOVING_AVERAGE_POINTS[period],
        LIMITS[period] // we need to get at most this amount of data charted
      );

      const minValue = data ? minBy(data, row => row.v).v : 0;
      const maxValue = data ? maxBy(data, row => row.v).v : 0;

      setChartData({ data: chartableData, averageValue: average, minValue, maxValue });
    };

    fetchData();
  }, [stat, period, network, oracleId, vaultId, t, chartData]);

  return { chartData, movingAverageDetail };
};

const addItems = (data, start, stop) => {
  let sum = 0;
  for (let j = start; j <= stop; j++) {
    sum += data[j].v;
  }
  return sum;
};

type ChartData = BeefyChartDataResponse & { moveAverageValue: number }[];

const getChartableData = (
  data: BeefyChartDataResponse,
  movingAveragePoints: number,
  chartDisplayPoints: number
) => {
  const startIndex = data.length > chartDisplayPoints ? data.length - chartDisplayPoints : 0;
  const chartableData: ChartData = [];
  let acum = 0;

  for (let i = startIndex; i < data.length; i++) {
    const safeStartingIndex = max([i - movingAveragePoints, 0]);
    const movingAverageForPoint =
      addItems(data, safeStartingIndex, i) / (i - safeStartingIndex + 1);
    acum += data[i].v;
    chartableData.push({ ...data[i], moveAverageValue: movingAverageForPoint });
  }

  const average = acum / (data.length - startIndex);

  return { chartableData, average };
};
