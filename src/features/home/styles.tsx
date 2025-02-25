import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  top: {
    backgroundColor: theme.palette.background.footerHeader,
  },
  vaultContainer: {
    paddingTop: '32px',
    paddingBottom: '32px',
    [theme.breakpoints.down('sm')]: { padding: '20px 12px' },
  },
});
