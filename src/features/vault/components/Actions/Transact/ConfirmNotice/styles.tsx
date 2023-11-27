import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  positive: {
    color: theme.palette.primary.main,
  },
  negative: {
    color: theme.palette.background.indicators.error,
  },
  changes: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1em',
    width: '100%',
  },
});
