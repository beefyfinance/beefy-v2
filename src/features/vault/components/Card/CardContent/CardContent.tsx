import { memo, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

type CardContentProps = {
  children: ReactNode;
  className?: string;
  disableDefaultClass?: boolean;
};

export const CardContent = memo<CardContentProps>(function CardContent({
  children,
  className,
  disableDefaultClass = false,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(className, { [classes.container]: !disableDefaultClass })}>{children}</div>
  );
});
