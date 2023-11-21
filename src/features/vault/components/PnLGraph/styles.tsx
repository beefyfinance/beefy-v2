import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  pnlContainer: {
    borderRadius: '12px',
    backgroundColor: theme.palette.background.v2.contentPrimary,
  },
  dashboardPnlContainer: {
    backgroundColor: theme.palette.background.v2.contentPrimary,
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
