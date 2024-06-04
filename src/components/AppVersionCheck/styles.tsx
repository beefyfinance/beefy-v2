import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  positioner: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    padding: '0 32px 32px 32px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'none' as const,
    [theme.breakpoints.down('xs')]: {
      padding: '0 16px 16px 16px',
    },
  },
  alert: {
    ...theme.typography['body-lg'],
    pointerEvents: 'auto' as const,
    flex: '0 1 auto',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: theme.palette.background.contentDark,
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column' as const,
    },
  },
  message: {
    flex: '1 1 auto',
  },
  action: {
    flex: '0 0 auto',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  button: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
});
