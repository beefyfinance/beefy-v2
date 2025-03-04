import { css, type CssStyles } from '@repo/styles/css';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';

const styles = {
  rowContainer: css.raw({
    display: 'grid',
    backgroundColor: 'background.content',
    padding: '16px',
    gridTemplateColumns: 'minmax(0, 30fr) minmax(0, 70fr)',
    columnGap: '16px',
    mdDown: {
      gridTemplateColumns: 'repeat(2,minmax(0, 50fr))',
    },
  }),
  rowMobileContainer: css.raw({
    padding: '16px',
    backgroundColor: 'background.content.dark',
  }),
};

type RowGapProps = PropsWithChildren<{
  css?: CssStyles;
}>;

export const Row = memo(function Row({ children, css: cssProp }: RowGapProps) {
  return <div className={css(styles.rowContainer, cssProp)}>{children}</div>;
});

export const RowMobile = memo(function RowMobile({ children, css: cssProp }: RowGapProps) {
  return <div className={css(styles.rowMobileContainer, cssProp)}>{children}</div>;
});
