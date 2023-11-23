import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  grid: {
    ...theme.typography['body-lg'],
    display: 'grid',
    rowGap: '8px',
    columnGap: '48px',
    gridTemplateColumns: '1fr auto',
  },
  label: {
    color: theme.palette.text.tooltips,
  },
  details: {
    color: theme.palette.text.tooltips,
    textAlign: 'right' as const,
  },
  amount: {},
  value: {
    ...theme.typography['subline-sm'],
    display: 'none' as const,
  },
});
