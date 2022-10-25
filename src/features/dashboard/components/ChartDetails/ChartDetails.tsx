import { makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import React, { memo } from 'react';
import { formatPercent } from '../../../../helpers/format';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface ChartDetailsProps {
  data: { key: string; value: BigNumber; percentage: number }[];
}

const COLORS = ['#5C70D6', '#5C99D6', '#5CC2D6', '#5CD6AD', '#70D65C', '#7FB24D'];

export const ChartDetails = memo<ChartDetailsProps>(function ({ data }) {
  const classes = useStyles();
  return (
    <div className={classes.itemsContainer}>
      {data.map((item, i) => (
        <div className={classes.item}>
          <div style={{ backgroundColor: COLORS[i % data.length] }} className={classes.square} />
          <div className={classes.label}>{item.key}</div>
          <div className={classes.value}>{formatPercent(item.percentage)}</div>
        </div>
      ))}
    </div>
  );
});
