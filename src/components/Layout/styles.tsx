import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: theme.palette.background.appBg,
  },
  top: {
    flex: '0 0 auto',
  },
  middle: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  bottom: {
    flex: '0 0 auto',
  },
});
