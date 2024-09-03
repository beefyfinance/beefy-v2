import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: 'var(--tooltip-content-vertical-gap, 8px)',
    columnGap: 'var(--tooltip-content-horizontal-gap, 16px)',
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    rowGap: 'var(--tooltip-content-vertical-gap, 8px)',
    columnGap: 'var(--tooltip-content-horizontal-gap, 16px)',
    justifyContent: 'space-between',
  },
  label: {
    ...theme.typography['body-sm'],
    color: 'var(--tooltip-label-color)',
  },
  value: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: 'var(--tooltip-value-color)',
    textAlign: 'right' as const,
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
      fontWeight: theme.typography['body-sm-med'].fontWeight,
      color: 'var(--tooltip-title-color)',
    },
    '& $value': {
      fontWeight: theme.typography['body-sm-med'].fontWeight,
      color: 'var(--tooltip-label-color)',
    },
  },
  graph: {},
  dashboard: {
    '& $label, & $value': {
      ...theme.typography['body-lg'],
    },
  },
});
