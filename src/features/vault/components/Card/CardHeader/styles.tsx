import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.contentDark,
    borderRadius: '12px 12px 0 0',
    padding: '24px',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
});
