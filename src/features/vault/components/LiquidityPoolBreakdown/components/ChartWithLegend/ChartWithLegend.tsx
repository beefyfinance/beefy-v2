import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { memo } from 'react';
import type { BreakdownMode, CalculatedBreakdownData } from '../../types';
import { Legend } from '../Legend';
import { Chart } from '../Chart';

const useStyles = makeStyles(styles);

export type ChartWithLegendProps = {
  breakdown: CalculatedBreakdownData;
  tab: BreakdownMode;
};
export const ChartWithLegend = memo<ChartWithLegendProps>(function ChartWithLegend({
  breakdown,
  tab,
}) {
  const classes = useStyles();

  const isUnderlying = tab === 'underlying';
  return (
    <div className={classes.holder}>
      <Chart assets={breakdown.assets} isUnderlying={isUnderlying} />
      <Legend
        assets={breakdown.assets}
        chainId={breakdown.chainId}
        className={classes.legend}
        isUnderlying={isUnderlying}
      />
    </div>
  );
});
