import { css } from '@repo/styles/css';

export const styles = {
  statsContainer: css.raw({
    display: 'grid',
    gap: '1px',
    gridTemplateColumns: 'repeat(3, 1fr)',
    smDown: {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  }),
  red: css.raw({
    color: 'indicators.error',
  }),
  green: css.raw({
    color: 'indicators.success',
  }),
  gray: css.raw({
    color: 'text.dark',
  }),
  itemContainer: css.raw({
    display: 'flex',
    alignItems: 'center',
    rowGap: 'var(--tooltip-content-vertical-gap, 8px)',
    columnGap: 'var(--tooltip-content-horizontal-gap, 16px)',
    justifyContent: 'space-between',
  }),
  label: css.raw({
    textStyle: 'body.sm',
    color: 'colorPalette.text.label',
  }),
  value: css.raw({
    textStyle: 'subline.sm',
    color: 'colorPalette.text.item',
    textAlign: 'right',
  }),
  tooltip: css.raw({
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer',
    },
    '& svg': {
      height: '12px',
      fontSize: '12px',
    },
  }),
};
