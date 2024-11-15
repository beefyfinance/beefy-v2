import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  banner: {
    ...theme.typography['body-lg-med'],
    backgroundColor: 'rgba(140, 147, 191, 0.1)',
    borderRadius: '8px',
  },
  box: {
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
  icon: {
    flex: 'auto 0 0',
    height: '24px',
    width: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    flexGrow: 1,
  },
  cross: {
    flex: 'auto 0 0',
    fill: theme.palette.text.middle,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  info: {},
  warning: {
    '& $box': {
      backgroundColor: 'rgba(209, 152, 71, 0.15)',
    },
  },
  error: {
    '& $box': {
      backgroundColor: 'rgba(209, 83, 71, 0.15)',
    },
  },
});
