import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  rewards: {
    ...theme.typography['body-lg-med'],
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    gap: '8px',
    color: theme.palette.text.middle,
    padding: '0',
  },
  icon: {
    width: '24px',
    height: '24px',
  },
  amount: {
    display: 'inline-flex',
    gap: '4px',
  },
  value: {},
});
