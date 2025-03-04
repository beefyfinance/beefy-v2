import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { memo } from 'react';
import type { BreakdownMode, CalculatedBreakdownData } from '../../types.ts';
import { Legend } from '../Legend/Legend.tsx';
import { Chart } from '../Chart/Chart.tsx';

const useStyles = legacyMakeStyles(styles);

export type ChartWithLegendProps = {
  breakdown: CalculatedBreakdownData;
  tab: BreakdownMode;
};
export const ChartWithLegend = memo(function ChartWithLegend({
  breakdown,
  tab,
}: ChartWithLegendProps) {
  const classes = useStyles();

  const isUnderlying = tab === 'underlying';
  return (
    <div className={classes.holder}>
      <Chart assets={breakdown.assets} isUnderlying={isUnderlying} />
      <Legend
        assets={breakdown.assets}
        chainId={breakdown.chainId}
        css={styles.legend}
        isUnderlying={isUnderlying}
      />
    </div>
  );
});
