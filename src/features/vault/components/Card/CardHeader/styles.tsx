import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px 12px 0 0',
    padding: '24px',
  },
});
