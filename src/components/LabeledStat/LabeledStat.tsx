import React, { memo, ReactNode } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { styles } from './styles';

const useStyles = makeStyles(styles);
const _LabeledStat = ({ value, boosted }: { value: ReactNode; boosted?: ReactNode }) => {
  const classes = useStyles();

  return (
    <>
      {boosted && <div className={classes.value}>{boosted}</div>}
      <div className={boosted ? classes.valueStrikethrough : classes.value}>{value}</div>
    </>
  );
};

export const LabeledStat = memo(_LabeledStat);
