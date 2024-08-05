import { memo, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type HorizontalLayoutProps = {
  className?: string;
  gap?: number;
  children: ReactNode;
};

export const HorizontalLayout = memo<HorizontalLayoutProps>(function HorizontalLayout({
  className,
  gap,
  children,
}) {
  const classes = useStyles(gap === undefined ? undefined : { gap });
  return <div className={clsx(classes.horizontal, className)}>{children}</div>;
});
