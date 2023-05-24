import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  pnlContainer: {
    borderRadius: '12px',
    backgroundColor: '#2D3153',
  },
  dashboardPnlContainer: {
    backgroundColor: '#242842',
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
