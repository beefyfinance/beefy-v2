import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  pnlContainer: {
    borderRadius: '12px',
    backgroundColor: '#2D3153',
  },
  dashboardPnlContainer: {
    backgroundColor: '#2D3153',
    borderRadius: '12px',
    [theme.breakpoints.down('sm')]: {
      borderRadius: '0px',
    },
  },
});
