import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    ...theme.typography['body-lg-med'],
    paddingBottom: theme.spacing(3),
  },
  box: {
    backgroundColor: 'rgba(140, 147, 191, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  content: {
    display: 'flex',
    alignItems: 'flex-start',
    flexGrow: 1,
    justifyContent: 'center',
    gap: '8px',
  },
  text: {},
  cross: {
    fill: '#D0D0DA',
    '&:hover': {
      cursor: 'pointer',
    },
  },
});
