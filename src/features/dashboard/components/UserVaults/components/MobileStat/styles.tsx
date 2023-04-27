import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  mobileStat: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    ...theme.typography['body-sm'],
    color: theme.palette.text.disabled,
    '& div': {},
    [theme.breakpoints.down('md')]: {
      justifyContent: 'space-between',
    },
  },
  value: {
    color: theme.palette.text.secondary,
  },
});
