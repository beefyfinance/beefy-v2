import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '2px',
    marginTop: '2px',
  },
  toggleContainer: {
    padding: '16px',
    backgroundColor: theme.palette.background.appBG,
    display: 'flex',
    justifyContent: 'center',
  },
  activeClassName: {
    backgroundColor: theme.palette.primary.main,
  },
  buttonText: {
    ...theme.typography['body-sm-med'],
  },
});
