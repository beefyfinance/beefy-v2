import { memo, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type LayoutProps = {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
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
