import { memo, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type VerticalLayoutProps = {
  className?: string;
  gap?: number;
  children: ReactNode;
};

export const VerticalLayout = memo<VerticalLayoutProps>(function VerticalLayout({
  className,
  gap,
  children,
}) {
  const classes = useStyles(gap === undefined ? undefined : { gap });
  return <div className={clsx(classes.vertical, className)}>{children}</div>;
});
