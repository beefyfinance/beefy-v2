import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  top: {
    backgroundColor: theme.palette.background.footer,
  },
  vaultContainer: {
    paddingTop: '32px',
    paddingBottom: '32px',
  },
});
