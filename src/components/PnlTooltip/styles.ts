import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: 'var(--tooltip-content-vertical-gap, 8px)',
    columnGap: 'var(--tooltip-content-horizontal-gap, 16px)',
    textStyle: 'body',
  }),
  itemContainer: css.raw({
    display: 'flex',
    alignItems: 'center',
    rowGap: 'var(--tooltip-content-vertical-gap, 8px)',
    columnGap: 'var(--tooltip-content-horizontal-gap, 16px)',
    justifyContent: 'space-between',
  }),
  label: css.raw({
    color: 'var(--tooltip-label-color)',
    '[data-compact] &': {
      textStyle: 'body.sm',
    },
  }),
  value: css.raw({
    color: 'var(--tooltip-value-color)',
    textAlign: 'right',
    '[data-compact] &': {
      textStyle: 'subline.sm',
    },
  }),
  valueBreakdown: css.raw({
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    rowGap: 'var(--tooltip-content-vertical-gap, 8px)',
    columnGap: 'var(--tooltip-content-horizontal-gap, 16px)',
    color: 'var(--tooltip-value-color)',
    paddingLeft: '8px',
  }),
  valueBreakdownLabel: css.raw({
    color: 'var(--tooltip-value-color)',
  }),
  valueBreakdownValue: css.raw({
    color: 'var(--tooltip-value-color)',
  }),
  totalLabel: css.raw({
    fontWeight: 'medium',
    color: 'var(--tooltip-title-color)',
  }),
  totalValue: css.raw({
    fontWeight: 'medium',
    color: 'var(--tooltip-label-color)',
  }),
};
