import React, { forwardRef, memo } from 'react';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/styles/makeStyles';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
const _LabeledStat = forwardRef(({ value, boosted, ...passthrough }: any, ref) => {
  const classes = useStyles();

  const valueClassName = React.useMemo(
    () => (boosted ? classes.valueStrikethrough : classes.value),
    [boosted, classes.value, classes.valueStrikethrough]
  );

  return (
    <div {...passthrough} ref={ref}>
      {boosted && <Typography className={classes.value}>{boosted}</Typography>}
      <Typography className={valueClassName}>{value}</Typography>
    </div>
  );
});

export const LabeledStat = memo(_LabeledStat);
