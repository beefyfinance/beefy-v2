import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  userStats: {
    display: 'flex',
  },
  stat: {
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: '32px',
    [theme.breakpoints.down('sm')]: {
      minWidth: '140px',
      margin: 0,
    },
  },
  value: {
    ...theme.typography['h2'],
    color: theme.palette.text.light,
  },
  label: {
    ...theme.typography['subline-lg'],
    display: 'inline-flex',
    color: theme.palette.text.dark,
  },
  blurred: {
    filter: 'blur(.5rem)',
  },
  obscured: {
    color: '#424866',
  },
});
