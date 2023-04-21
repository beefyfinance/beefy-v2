import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type LayoutProps = {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export const Layout = memo<LayoutProps>(function Layout({ header, footer, children }) {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.top}>{header}</div>
      <div className={classes.middle}>{children}</div>
      <div className={classes.bottom}>{footer}</div>
    </div>
  );
});
