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
    ...theme.typography['body-lg'],
    minWidth: '120px',
    textAlign: 'left' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  itemContainer: {
    display: 'flex',
    alignIterms: 'center',
    gap: '8px 16px',
    justifyContent: 'space-between',
  },
  label: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.secondary,
  },
  value: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.primary,
    textAlign: 'right' as const,
  },
  valueBreakdown: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '4px',
    color: theme.palette.text.secondary,
    lineHeight: '1',
    paddingLeft: '8px',
    '& $value, & $label': {
      color: theme.palette.text.dark,
      lineHeight: '1',
    },
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
