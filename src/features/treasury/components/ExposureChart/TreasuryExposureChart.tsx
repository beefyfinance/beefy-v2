import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { memo, useMemo } from 'react';
import { PieChart } from '../../../../components/PieChart/PieChart.tsx';
import { ExposureBar } from '../ExposureBar/ExposureBar.tsx';
import { ExposureLegend } from '../ExposureLegend/ExposureLegend.tsx';
import { styles } from './styles.ts';
import type { GenericExposurePieChartProps } from '../../../../components/PieChart/types.ts';
import { getTopNArray } from '../../../data/utils/array-utils.ts';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { Hidden } from '../../../../components/MediaQueries/Hidden.tsx';

const useStyles = legacyMakeStyles(styles);

type TreasuryExposureChartProps = Omit<GenericExposurePieChartProps, 'type'>;

export const TreasuryExposureChart = memo(function TreasuryExposureChart({
  data,
  formatter,
}: TreasuryExposureChartProps) {
  const classes = useStyles();
  const topSix = useMemo(
    () =>
      getTopNArray(data, 'percentage', 6, {
        key: 'others',
        value: BIG_ZERO,
        percentage: 0,
      }),
    [data]
  );

  return (
    <div className={classes.container}>
      <Hidden to="xs">
        <ExposureBar data={topSix} />
      </Hidden>
      <Hidden from="sm">
        <PieChart data={topSix} type={'generic'} formatter={formatter} />
      </Hidden>
      <ExposureLegend data={topSix} formatter={formatter} />
    </div>
  );
});
