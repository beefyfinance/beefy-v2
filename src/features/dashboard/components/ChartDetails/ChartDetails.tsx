import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { formatLargePercent } from '../../../../helpers/format';
import type { BaseEntry } from '../../../data/utils/array-utils';
import { styles } from './styles';
import { CHART_COLORS } from '../../../../helpers/charts';

const useStyles = makeStyles(styles);

type ItemType = BaseEntry & { label?: string };

interface ChartDetailsProps {
  data: ItemType[];
}

export const ChartDetails = memo<ChartDetailsProps>(function ChartDetails({ data }) {
  const classes = useStyles();

  return (
    <div className={classes.itemsContainer}>
      {data.map((item, i) => (
        <div key={item.key} className={classes.item}>
          <div className={classes.flex}>
            <div
              style={{ backgroundColor: CHART_COLORS[i % data.length] }}
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
