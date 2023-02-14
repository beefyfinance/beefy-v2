import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { formatPercent } from '../../../../helpers/format';
import { BaseEntry } from '../../../data/utils/array-utils';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface ExposureBarProps {
  data: BaseEntry[];
}

const COLORS = ['#5C70D6', '#5C99D6', '#5CC2D6', '#5CD6AD', '#70D65C', '#1e9c05'];

export const ExposureBar = memo<ExposureBarProps>(function ({ data }) {
  const classes = useStyles();
  return (
    <div className={classes.bar}>
      {Object.values(data).map((item, i) => (
        <div
          key={item.key}
          style={{
            backgroundColor: COLORS[i],
            width: formatPercent(item.percentage, 2, '0%'),
          }}
          className={classes.barItem}
        />
      ))}
    </div>
  );
});
