import React, { memo } from 'react';
import { CircularProgress, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type LoadingIndicatorProps = {
  text: string;
  className?: string;
};
export const LoadingIndicator = memo<LoadingIndicatorProps>(function LoadingIndicator({
  text,
  className,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.container, className)}>
      <CircularProgress className={classes.icon} />
      <div className={classes.text}>{text}</div>
    </div>
  );
});
