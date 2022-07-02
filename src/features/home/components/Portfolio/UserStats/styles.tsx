import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  userStats: {
    display: 'flex',
  },
  stat: {
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      margin: '8px 24px 8px 0px',
    },
  },
  value: {
    ...theme.typography['h2'],
    color: theme.palette.text.primary,
  },
  label: {
    ...theme.typography['subline-lg'],
    display: 'inline-flex',
    color: theme.palette.text.disabled,
  },
  blurred: {
    filter: 'blur(.5rem)',
  },
  obscured: {
    color: '#424866',
  },
});
