import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  buttons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    width: '100%',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    width: '100%',
  },
  feesContainer: {
    background: theme.palette.background.contentLight,
    borderRadius: '8px',
  },
});
