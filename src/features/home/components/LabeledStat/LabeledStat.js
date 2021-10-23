import React, { forwardRef, memo } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import styles from './styles';

const useStyles = makeStyles(styles);

const LabeledStat = forwardRef(({ value, boosted, ...passthrough }, ref) => {
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

export default memo(LabeledStat);
