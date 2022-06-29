import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
  disableDefaultClass?: boolean;
};

export const CardContent = memo<CardContentProps>(function ({
  children,
  className,
  disableDefaultClass = false,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(className, { [classes.container]: !disableDefaultClass })}>{children}</div>
  );
});
