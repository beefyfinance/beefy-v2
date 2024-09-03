import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  rows: {
    ...theme.typography['body-lg'],
    display: 'grid',
    rowGap: '8px',
    columnGap: '48px',
    gridTemplateColumns: '1fr auto',
  },
  label: {
    color: 'var(--tooltip-label-color)',
    '&:nth-last-child(2)': {
      fontWeight: theme.typography['body-lg-med'].fontWeight,
      color: 'var(--tooltip-title-color)',
    },
  },
  value: {
    color: 'var(--tooltip-value-color)',
    textAlign: 'right' as const,
    '&:last-child': {
      fontWeight: theme.typography['body-lg-med'].fontWeight,
      color: 'var(--tooltip-label-color)',
    },
  },
});
