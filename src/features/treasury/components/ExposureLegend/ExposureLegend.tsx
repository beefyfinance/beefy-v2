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
        const keyFormatted = formatter ? formatter(item.key) : item.key;
        return (
          <div key={item.key} className={classes.legendItem}>
            <div className={classes.square} style={{ backgroundColor: COLORS[i] }} />
            <div
              className={clsx(classes.label, {
                [classes.uppercase]: keyIsToken(item.key),
              })}
            >
              {keyFormatted} <span>{formatPercent(item.percentage, 2, '0%')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

function keyIsToken(key: string) {
  if (key === 'others') return false;
  if (key === 'stables') return false;
  return true;
}
