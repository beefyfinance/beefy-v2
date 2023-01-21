import { Hidden, makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { PieChart, TypeChart } from '../../../../components/PieChart/PieChart';
import { BaseEntry } from '../../../data/utils/array-utils';
import { ExposureBar } from '../ExposureBar';
import { ExposureLegend } from '../ExposureLegend';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface ExposureChartProps {
  data: BaseEntry[];
  formatter?: (s: string) => string;
  type?: TypeChart;
}

export const ExposureChart = memo<ExposureChartProps>(function ({ data, formatter, type }) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Hidden smDown>
        <ExposureBar data={data} />
      </Hidden>
      <Hidden mdUp>
        <PieChart data={data} type={type} formatter={formatter} />
      </Hidden>
      <ExposureLegend data={data} formatter={formatter} />
    </div>
  );
});
