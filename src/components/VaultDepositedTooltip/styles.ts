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
    color: '#272B4A',
  },
  details: {
    color: '#272B4A',
    textAlign: 'right' as const,
  },
  amount: {},
  value: {
    ...theme.typography['subline-sm'],
    display: 'none' as const,
  },
});
