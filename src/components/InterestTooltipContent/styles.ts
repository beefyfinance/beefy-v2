import { css } from '@repo/styles/css';

export const styles = {
  rows: css.raw({
    textStyle: 'body',
    display: 'grid',
    rowGap: '8px',
    columnGap: '48px',
    gridTemplateColumns: '1fr auto',
  }),
  label: css.raw({
    color: 'var(--tooltip-label-color)',
    '&:nth-last-child(2)': {
      fontWeight: 'body.medium',
      color: 'var(--tooltip-title-color)',
    },
  }),
  value: css.raw({
    color: 'var(--tooltip-value-color)',
    textAlign: 'right',
    '&:last-child': {
      fontWeight: 'body.medium',
      color: 'var(--tooltip-label-color)',
    },
  }),
};
