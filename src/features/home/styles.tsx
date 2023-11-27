import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  top: {
    backgroundColor: theme.palette.background.footerHeader,
  },
  vaultContainer: {
    paddingTop: '32px',
    paddingBottom: '32px',
  },
});
