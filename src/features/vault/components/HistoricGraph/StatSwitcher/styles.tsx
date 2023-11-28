import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  tabs: {
    marginTop: '16px',
    backgroundColor: 'transparent',
    [theme.breakpoints.up('sm')]: {
      marginTop: 0,
    },
  },
});
