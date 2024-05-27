import { Hidden, makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { PieChart } from '../../../../components/PieChart/PieChart';
import type { BaseEntry } from '../../../data/utils/array-utils';
import { ExposureBar } from '../ExposureBar';
import { ExposureLegend } from '../ExposureLegend';
import { styles } from './styles';
import type { PieChartProps, PieChartType } from '../../../../components/PieChart/types';

const useStyles = makeStyles(styles);

interface ExposureChartProps {
  data: BaseEntry[];
  formatter?: (s: string) => string;
  type: PieChartType;
}

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
