import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    ...theme.typography['body-lg-med'],
    backgroundColor: theme.palette.background.footer,
    paddingBottom: theme.spacing(3),
  },
  icon: { marginRight: theme.spacing(1) },
  box: {
    backgroundColor: 'rgba(140, 147, 191, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    alignItems: 'flex-start',
    flexGrow: 1,
    justifyContent: 'center',
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
  cross: {
    fill: '#D0D0DA',
    '&:hover': {
      cursor: 'pointer',
    },
  },
});
