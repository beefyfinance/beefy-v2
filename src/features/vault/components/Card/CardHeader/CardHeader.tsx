import type { ReactNode } from 'react';
import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type CardHeaderProps = {
  children: ReactNode;
  className?: string;
  disableDefaultClass?: boolean;
};
export const CardHeader = memo<CardHeaderProps>(function CardHeader({
  children,
  className,
  disableDefaultClass = false,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(className, { [classes.container]: !disableDefaultClass })}>{children}</div>
  );
});
