import { makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import React, { memo } from 'react';
import { ChartDetails } from '../ChartDetails';
import { Chart } from './Chart';
import { styles } from './styles';

interface ExposureChartProps {
  title: string;
  data: { key: string; value: BigNumber; percentage: number }[];
  type: 'chain' | 'platform' | 'token';
}

const useStyles = makeStyles(styles);

export const ExposureChart = memo<ExposureChartProps>(function ({ title, data, type }) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.title}>{title}</div>
      {data && (
        <div className={classes.infoContainer}>
          <Chart data={data} type={type} />
          <ChartDetails data={data} />
        </div>
      )}
    </div>
  );
});
