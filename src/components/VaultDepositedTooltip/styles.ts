import { css } from '@repo/styles/css';

export const styles = {
  grid: css.raw({
    textStyle: 'body',
    display: 'grid',
    rowGap: '8px',
    columnGap: '48px',
    gridTemplateColumns: '1fr auto',
  }),
  label: css.raw({
    color: 'var(--tooltip-title-color)',
  }),
  details: css.raw({
    color: 'var(--tooltip-title-color)',
    textAlign: 'right',
  }),
  amount: css.raw({}),
  value: css.raw({
    textStyle: 'subline.sm',
    display: 'none',
  }),
  notInBoost: css.raw({
    gridColumn: '1 / span 2',
    fontWeight: 'medium',
  }),
};
