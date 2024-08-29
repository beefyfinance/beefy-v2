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
    color: theme.palette.text.tooltip.label,
  },
  value: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.tooltip.value,
    textAlign: 'right' as const,
  },
  valueBreakdown: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    rowGap: 'var(--tooltip-content-vertical-gap, 8px)',
    columnGap: 'var(--tooltip-content-horizontal-gap, 16px)',
    color: theme.palette.text.tooltip.label,
    paddingLeft: '8px',
    '& $value, & $label': {
      color: theme.palette.text.tooltip.label,
    },
  },
});
