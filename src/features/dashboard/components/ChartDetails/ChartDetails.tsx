import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { formatPercent } from '../../../../helpers/format';
import { BaseEntry } from '../../../data/utils/array-utils';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type ItemType = BaseEntry & { label?: string };

interface ChartDetailsProps {
  data: ItemType[];
}

const COLORS = ['#5C70D6', '#5C99D6', '#5CC2D6', '#5CD6AD', '#70D65C', '#7FB24D'];

export const ChartDetails = memo<ChartDetailsProps>(function ({ data }) {
  const classes = useStyles();

  return (
    <div className={classes.itemsContainer}>
      {data.map((item, i) => (
        <div key={item.key} className={classes.item}>
          <div className={classes.flex}>
            <div style={{ backgroundColor: COLORS[i % data.length] }} className={classes.square} />
            <div className={classes.label}>{item.label ?? item.key}</div>
          </div>
          <div className={classes.value}>{formatPercent(item.percentage)}</div>
        </div>
      ))}
    </div>
  );
});
