import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { css } from '@repo/styles/css';
import { memo } from 'react';
import { formatLargePercent } from '../../../../helpers/format.ts';
import type { BaseEntry } from '../../../data/utils/array-utils.ts';
import { styles } from './styles.ts';
import { CHART_COLORS } from '../../../../helpers/charts.ts';

const useStyles = legacyMakeStyles(styles);

interface ExposureLegendProps {
  data: BaseEntry[];
  formatter?: (s: string) => string;
}

export const ExposureLegend = memo(function ExposureLegend({
  data,
  formatter,
}: ExposureLegendProps) {
  const classes = useStyles();
  return (
    <div className={classes.legendContainer}>
      {Object.values(data).map((item, i) => {
        return (
          <div key={item.key} className={classes.legendItem}>
            <div
              className={classes.square}
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <Label item={item} formatter={formatter} />
          </div>
        );
      })}
    </div>
  );
});

type ItemType = BaseEntry & {
  label?: string;
};

interface LabelProps {
  item: ItemType;
  formatter?: (s: string) => string;
}

const Label = memo(function Label({ item, formatter }: LabelProps) {
  const label = item.label ?? item.key;
  const labelFormatted = formatter ? formatter(label) : label;
  return (
    <div className={css(styles.label)}>
      {labelFormatted} <span>{formatLargePercent(item.percentage, 2, '0%')}</span>
    </div>
  );
});
