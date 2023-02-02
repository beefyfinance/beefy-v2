import { Hidden, makeStyles } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { PieChart, TypeChart } from '../../../../components/PieChart/PieChart';
import { BaseEntry, getTopNArray } from '../../../data/utils/array-utils';
import { KeysOfType } from '../../../data/utils/types-utils';
import { ExposureBar } from '../ExposureBar';
import { ExposureLegend } from '../ExposureLegend';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface ExposureChartProps {
  data: BaseEntry[];
  formatter?: (s: string) => string;
  type?: TypeChart;
  formatKey?: KeysOfType<BaseEntry, string | number>;
}

export const ExposureChart = memo<ExposureChartProps>(function ({
  data,
  formatter,
  type,
  formatKey = 'percentage',
}) {
  const classes = useStyles();

  const formattedData = useMemo(() => {
    return getTopNArray(data, formatKey);
  }, [data, formatKey]);

  return (
    <div className={classes.container}>
      <Hidden xsDown>
        <ExposureBar data={formattedData} />
      </Hidden>
      <Hidden smUp>
        <PieChart data={formattedData} type={type} formatter={formatter} />
      </Hidden>
      <ExposureLegend data={formattedData} formatter={formatter} />
    </div>
  );
});
