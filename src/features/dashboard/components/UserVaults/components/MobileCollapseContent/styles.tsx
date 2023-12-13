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
    backgroundColor: theme.palette.background.contentDark,
    display: 'flex',
    justifyContent: 'center',
  },
  buttonText: {
    ...theme.typography['body-sm-med'],
  },
});
