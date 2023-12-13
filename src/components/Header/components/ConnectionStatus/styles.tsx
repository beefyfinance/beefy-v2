import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    backgroundColor: theme.palette.background.contentDark,
    alignItems: 'center',
    borderRadius: '8px',
  },
});
