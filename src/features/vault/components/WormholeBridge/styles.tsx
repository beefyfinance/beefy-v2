import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    position: 'absolute' as const,
    outline: 'none',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    [theme.breakpoints.down('xs')]: {
      padding: '0',
    },
  },
  embed: {
    margin: 0,
    padding: 0,
    border: 0,
    height: '750px',
    maxHeight: '100%',
    width: '682px',
    maxWidth: '100%',
    borderRadius: '12px',
    background: theme.palette.background.contentPrimary,
  },
  button: {},
});
