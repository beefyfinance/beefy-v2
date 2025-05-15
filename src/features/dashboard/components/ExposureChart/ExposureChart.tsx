import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { memo } from 'react';
import { PieChart } from '../../../../components/PieChart/PieChart.tsx';
import { ChartDetails } from '../ChartDetails/ChartDetails.tsx';
import { styles } from './styles.ts';
import type { ExposureDashboardChartProps } from './types.ts';

const useStyles = legacyMakeStyles(styles);

export const ExposureChart = memo(function ExposureChart({
  title,
  ...rest
}: ExposureDashboardChartProps) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {title ?
        <div className={classes.title}>{title}</div>
      : null}
      {rest.data ?
        <div className={classes.infoContainer}>
          <PieChart {...rest} />
          <ChartDetails data={rest.data} />
        </div>
      : null}
    </div>
  );
});
