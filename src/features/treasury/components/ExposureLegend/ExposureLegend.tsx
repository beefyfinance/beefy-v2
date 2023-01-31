import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo } from 'react';
import { formatPercent } from '../../../../helpers/format';
import { BaseEntry } from '../../../data/utils/array-utils';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface ExposureLegendProps {
  data: BaseEntry[];
  formatter?: (s: string) => string;
}

const COLORS = ['#5C70D6', '#5C99D6', '#5CC2D6', '#5CD6AD', '#70D65C', '#1e9c05'];

export const ExposureLegend = memo<ExposureLegendProps>(function ({ data, formatter }) {
  const classes = useStyles();
  return (
    <div className={classes.legendContainer}>
      {Object.values(data).map((item, i) => {
        return (
          <div key={item.key} className={classes.legendItem}>
            <div className={classes.square} style={{ backgroundColor: COLORS[i] }} />
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

const Label = memo<LabelProps>(function ({ item, formatter }) {
  const classes = useStyles();
  const label = item.label ?? item.key;
  const labelFormatted = formatter ? formatter(label) : label;
  return (
    <div className={clsx(classes.label)}>
      {labelFormatted} <span>{formatPercent(item.percentage, 2, '0%')}</span>
    </div>
  );
});
