import { memo, type ReactNode } from 'react';
import { layoutRecipe } from './styles.ts';

export type LayoutProps = {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export const Layout = memo<LayoutProps>(function Layout({ header, footer, children }) {
  const classes = layoutRecipe();

  return (
    <div className={classes.wrapper}>
      <div className={classes.top}>{header}</div>
      <div className={classes.middle}>{children}</div>
      <div className={classes.bottom}>{footer}</div>
    </div>
  );
});
