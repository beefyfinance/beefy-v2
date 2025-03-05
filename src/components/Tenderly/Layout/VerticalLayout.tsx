import { memo, type ReactNode } from 'react';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';

export type VerticalLayoutProps = {
  css?: CssStyles;
  gap?: number;
  children: ReactNode;
};

export const VerticalLayout = memo(function VerticalLayout({
  css: cssProp,
  gap,
  children,
}: VerticalLayoutProps) {
  return (
    <div className={css(styles.vertical, cssProp)} style={{ gap: `${gap}px` }}>
      {children}
    </div>
  );
});
