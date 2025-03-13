import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { memo } from 'react';
import { formatLargePercent } from '../../../../helpers/format.ts';
import type { BaseEntry } from '../../../data/utils/array-utils.ts';
import { styles } from './styles.ts';
import { CHART_COLORS } from '../../../../helpers/charts.ts';

const useStyles = legacyMakeStyles(styles);

interface ExposureBarProps {
  data: BaseEntry[];
}

export const ExposureBar = memo(function ExposureBar({ data }: ExposureBarProps) {
  const classes = useStyles();
  return (
    <div className={classes.bar}>
      {Object.values(data).map((item, i) => (
        <div
          key={item.key}
          style={{
            backgroundColor: CHART_COLORS[i],
            width: formatLargePercent(item.percentage, 2, '0%'),
          }}
          className={classes.barItem}
        />
      ))}
    </div>
  );
});
