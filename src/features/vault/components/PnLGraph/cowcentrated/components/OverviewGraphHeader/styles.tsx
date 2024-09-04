import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  statsContainer: {
    display: 'grid',
    gap: '1px',
    gridTemplateColumns: 'repeat(3, 1fr)',
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
  red: {
    color: theme.palette.background.indicators.error,
  },
  green: {
    color: theme.palette.background.indicators.success,
  },
  gray: {
    color: theme.palette.text.dark,
  },
  tooltipContent: {
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
    ...theme.typography['body-sm'],
    color: 'var(--tooltip-label-color)',
  },
  value: {
    ...theme.typography['subline-sm'],
    color: 'var(--tooltip-value-color)',
    textAlign: 'right' as const,
  },
  tooltip: {
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer' as const,
    },
    '& svg': {
      height: '12px',
      fontSize: '12px',
    },
  },
});
