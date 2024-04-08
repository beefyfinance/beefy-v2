import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo } from 'react';
import { formatLargePercent } from '../../../../helpers/format';
import type { BaseEntry } from '../../../data/utils/array-utils';
import { styles } from './styles';
import { CHART_COLORS } from '../../../../helpers/charts';

const useStyles = makeStyles(styles);

interface ExposureLegendProps {
  data: BaseEntry[];
  formatter?: (s: string) => string;
}

export const ExposureLegend = memo<ExposureLegendProps>(function ExposureLegend({
  data,
  formatter,
}) {
  const classes = useStyles();
  return (
    <div className={classes.legendContainer}>
      {Object.values(data).map((item, i) => {
        return (
          <div key={item.key} className={classes.legendItem}>
            <div className={classes.square} style={{ backgroundColor: CHART_COLORS[i] }} />
            <Label item={item} formatter={formatter} />
          </div>
        );
      })}
    </div>
  );
});

type ItemType = BaseEntry & { label?: string };

interface LabelProps {
  item: ItemType;
  formatter?: (s: string) => string;
}

const Label = memo<LabelProps>(function Label({ item, formatter }) {
  const classes = useStyles();
  const label = item.label ?? item.key;
  const labelFormatted = formatter ? formatter(label) : label;
  return (
    <div className={clsx(classes.label)}>
      {labelFormatted} <span>{formatLargePercent(item.percentage, 2, '0%')}</span>
    </div>
  );
});
