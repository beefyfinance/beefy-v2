import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  banner: {
    ...theme.typography['body-lg-med'],
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
  icon: {
    flex: 'auto 0 0',
    height: '24px',
    width: '24px',
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
});
