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
  card: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },
  content: {
    padding: '0px',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },
  graphContainer: {
    backgroundColor: theme.palette.background.contentPrimary,
    '&:last-child': {
      borderRadius: '0px 0px 12px 12px',
    },
  },
  dashboardPnlContainer: {
    backgroundColor: theme.palette.background.contentPrimary,
    borderRadius: '12px',
    [theme.breakpoints.down('sm')]: {
      borderRadius: '0px',
    },
  },
  tabsDashboard: {
    '& .MuiTab-root': {
      ...theme.typography['subline-sm'],
    },
  },
});
