import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: 'var(--tooltip-content-vertical-gap, 8px)',
    columnGap: 'var(--tooltip-content-horizontal-gap, 16px)',
    ...theme.typography['body-lg'],
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    rowGap: 'var(--tooltip-content-vertical-gap, 8px)',
    columnGap: 'var(--tooltip-content-horizontal-gap, 16px)',
    justifyContent: 'space-between',
  },
  label: {
    color: 'var(--tooltip-label-color)',
    '[data-compact] &': {
      ...theme.typography['body-sm'],
    },
  },
  value: {
    color: 'var(--tooltip-value-color)',
    textAlign: 'right' as const,
    '[data-compact] &': {
      ...theme.typography['subline-sm'],
    },
  },
  valueBreakdown: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    rowGap: 'var(--tooltip-content-vertical-gap, 8px)',
    columnGap: 'var(--tooltip-content-horizontal-gap, 16px)',
    color: 'var(--tooltip-value-color)',
    paddingLeft: '8px',
    '& $value, & $label': {
      color: 'var(--tooltip-value-color)',
    },
  },
  total: {
    '& $label': {
      fontWeight: theme.typography['body-lg-med'].fontWeight,
      color: 'var(--tooltip-title-color)',
    },
    '& $value': {
      fontWeight: theme.typography['body-lg-med'].fontWeight,
      color: 'var(--tooltip-label-color)',
    },
  },
});
