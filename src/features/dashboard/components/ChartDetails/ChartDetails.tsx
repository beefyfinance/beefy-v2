import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { formatPercent } from '../../../../helpers/format';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface ChartDetailsProps {
  data: any;
}

export const ChartDetails = memo<ChartDetailsProps>(function ({ data }) {
  const classes = useStyles();
  return (
    <div className={classes.itemsContainer}>
      {data.map(item => (
        <div className={classes.item}>
          <div style={{ backgroundColor: item.color }} className={classes.square} />
          <div className={classes.label}>{item.key}</div>
          <div className={classes.value}>{formatPercent(item.percentage)}</div>
        </div>
      ))}
    </div>
  );
});
