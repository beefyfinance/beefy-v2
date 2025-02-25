import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
  description: {
    ...theme.typography['body-md'],
    color: theme.palette.text.middle,
  },
});
