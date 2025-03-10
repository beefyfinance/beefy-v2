import type { ReactNode } from 'react';
import { memo } from 'react';
import { css, type CssStyles } from '@repo/styles/css';

export type AmountLabelProps = {
  children: ReactNode;
  css?: CssStyles;
};

export const AmountLabel = memo(function AmountLabel({ children, css: cssProp }: AmountLabelProps) {
  return <div className={css(cssProp)}>{children}</div>;
});
