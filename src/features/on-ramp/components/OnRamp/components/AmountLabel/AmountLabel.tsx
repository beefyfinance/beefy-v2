import React, { memo, ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type AmountLabelProps = {
  children: ReactNode;
  className?: string;
};
export const AmountLabel = memo<AmountLabelProps>(function AmountLabel({ children, className }) {
  const classes = useStyles();

  return <div className={clsx(classes.label, className)}>{children}</div>;
});
