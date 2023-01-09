import React, { memo, PropsWithChildren } from 'react';
import { makeStyles, Paper } from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type CardProps = PropsWithChildren<{
  className?: string;
}>;
export const Card = memo<CardProps>(function ({ className, children }) {
  const classes = useStyles();

  return <Paper className={clsx(classes.container, className)}>{children}</Paper>;
});
