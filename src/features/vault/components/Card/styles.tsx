import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    borderRadius: '12px',
    background: theme.palette.background.v2.contentPrimary,
    '&.MuiPaper-elevation1': {
      boxShadow: '0px 0px 32px 0px #0000001A',
    },
  },
});
