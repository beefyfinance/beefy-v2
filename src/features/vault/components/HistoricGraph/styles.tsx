import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  header: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      padding: '16px',
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
    padding: 0,
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },
});
