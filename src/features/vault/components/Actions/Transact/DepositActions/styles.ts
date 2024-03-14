import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    width: '100%',
  },
  btns: {
    background: theme.palette.background.contentLight,
    borderRadius: '8px',
  },
});
