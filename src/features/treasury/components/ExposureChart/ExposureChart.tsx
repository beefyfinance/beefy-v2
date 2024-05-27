import { Hidden, makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { PieChart } from '../../../../components/PieChart/PieChart';
import { ExposureBar } from '../ExposureBar';
import { ExposureLegend } from '../ExposureLegend';
import { styles } from './styles';
import type { PieChartProps } from '../../../../components/PieChart/types';

const useStyles = makeStyles(styles);

export const ExposureChart = memo<PieChartProps>(function ExposureChart(props) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Hidden xsDown>
        <ExposureBar data={props.data} />
      </Hidden>
      <Hidden smUp>
        <PieChart {...props} />
      </Hidden>
      <ExposureLegend data={props.data} formatter={props.formatter} />
    </div>
  );
});
