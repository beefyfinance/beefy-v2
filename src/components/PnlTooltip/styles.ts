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
    color: 'colorPalette.text.label',
    '[data-compact] &': {
      textStyle: 'body.sm',
    },
  }),
  value: css.raw({
    color: 'colorPalette.text.item',
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
    color: 'colorPalette.text.item',
    paddingLeft: '8px',
  }),
  valueBreakdownLabel: css.raw({
    color: 'colorPalette.text.item',
  }),
  valueBreakdownValue: css.raw({
    color: 'colorPalette.text.item',
  }),
  totalLabel: css.raw({
    fontWeight: 'medium',
    color: 'colorPalette.text.title',
  }),
  totalValue: css.raw({
    fontWeight: 'medium',
    color: 'colorPalette.text.label',
  }),
};
