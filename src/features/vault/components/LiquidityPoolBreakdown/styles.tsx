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
  tabs: {
    marginTop: '16px',
    backgroundColor: 'transparent',
    [theme.breakpoints.up('sm')]: {
      marginTop: 0,
    },
  },
  layout: {
    backgroundColor: theme.palette.background.contentPrimary,
    borderRadius: '0 0 12px 12px',
    [theme.breakpoints.up('lg')]: {
      display: 'grid',
      gridTemplateColumns: '232fr 484fr',
    },
  },
});
