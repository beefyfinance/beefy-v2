import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.palette.background.v2.contentPrimary,
    borderRadius: '0 0 12px 12px',
    padding: '24px',
  },
});
