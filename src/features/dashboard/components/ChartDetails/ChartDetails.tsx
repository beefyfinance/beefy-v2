import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { memo } from 'react';
import { formatLargePercent } from '../../../../helpers/format.ts';
import type { BaseEntry } from '../../../data/utils/array-utils.ts';
import { styles } from './styles.ts';
import { CHART_COLORS } from '../../../../helpers/charts.ts';

const useStyles = legacyMakeStyles(styles);

type ItemType = BaseEntry & {
  label?: string;
};

interface ChartDetailsProps {
  data: ItemType[];
}

export const ChartDetails = memo(function ChartDetails({ data }: ChartDetailsProps) {
  const classes = useStyles();

  return (
    <div className={classes.itemsContainer}>
      {data.map((item, i) => (
        <div key={item.key} className={classes.item}>
          <div className={classes.flex}>
            <div
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              className={classes.square}
            />
            <div className={classes.label}>{item.label ?? item.key}</div>
          </div>
          <div className={classes.value}>{formatLargePercent(item.percentage)}</div>
        </div>
      ))}
    </div>
  );
});
