import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { makeStyles, Paper } from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type CardProps = PropsWithChildren<{
  className?: string;
  id?: string;
}>;
export const Card = memo<CardProps>(function Card({ className, children, id }) {
  const classes = useStyles();

  return (
    <Paper id={id} className={clsx(classes.container, className)}>
      {children}
    </Paper>
  );
});
