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
    color: theme.palette.text.primary,
    padding: '8px',
    minWidth: '120px',
    background: theme.palette.background.contentDark,
    borderRadius: '4px',
    textAlign: 'left' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  tooltipTitle: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  itemContainer: {
    display: 'flex',
    alignIterms: 'center',
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
  },
  arrow: { color: theme.palette.background.contentDark },
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
