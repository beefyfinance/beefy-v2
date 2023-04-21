import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'none',
    [theme.breakpoints.only('md')]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      columnGap: '32px',
    },
  },
  boostText: {
    color: '#DB8332',
  },
});
