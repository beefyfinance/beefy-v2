import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  mobileStat: {
    ...theme.typography['body-sm'],
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    color: theme.palette.text.dark,
    [theme.breakpoints.down('md')]: {
      justifyContent: 'space-between',
    },
  },
  value: {
    color: theme.palette.text.middle,
  },
});
