import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.footerHeader,
    padding: `24px 0 48px 0`,
    [theme.breakpoints.down('sm')]: {
      padding: `24px 0 32px 0`,
    },
  },
  title: {
    ...theme.typography.h1,
    marginBottom: '24px',
  },
});
