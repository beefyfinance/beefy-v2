import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { PieChart } from '../../../../components/PieChart/PieChart';
import { ChartDetails } from '../ChartDetails';
import { styles } from './styles';
import type { ExposureDashboardChartProps } from './types';

const useStyles = makeStyles(styles);

export const ExposureChart = memo<ExposureDashboardChartProps>(function ExposureChart({
  title,
  ...rest
}) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {title ? <div className={classes.title}>{title}</div> : null}
      {rest.data ? (
        <div className={classes.infoContainer}>
          <PieChart {...rest} />
          <ChartDetails data={rest.data} />
        </div>
      ) : null}
    </div>
  );
});
