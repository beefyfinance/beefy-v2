import React, { memo, ReactNode } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles as any);
const _LabeledStat = ({
  value,
  boosted,
  variant = 'small',
}: {
  value: ReactNode;
  boosted: boolean;
  variant: 'small' | 'large';
}) => {
  const classes = useStyles();

  const valueClassName = React.useMemo(
    () => (boosted ? classes.valueStrikethrough : classes.value),
    [boosted, classes.value, classes.valueStrikethrough]
  );

  return (
    <>
      {boosted && (
        <Typography className={clsx({ [classes.value]: true, large: variant === 'large' })}>
          {boosted}
        </Typography>
      )}
      <Typography className={clsx({ [valueClassName]: true, large: variant === 'large' })}>
        {value}
      </Typography>
    </>
  );
};

export const LabeledStat = memo(_LabeledStat);
