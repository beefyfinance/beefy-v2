import { memo, type ReactNode } from 'react';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';

export type HorizontalLayoutProps = {
  css?: CssStyles;
  gap?: number;
  children: ReactNode;
};

export const HorizontalLayout = memo(function HorizontalLayout({
  css: cssProp,
  gap,
  children,
}: HorizontalLayoutProps) {
  return (
    <div className={css(styles.horizontal, cssProp)} style={{ gap: `${gap}px` }}>
      {children}
    </div>
  );
});
