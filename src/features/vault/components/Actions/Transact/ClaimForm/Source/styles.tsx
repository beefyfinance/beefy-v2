import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  rewards: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    backgroundColor: theme.palette.background.contentLight,
    borderRadius: '8px',
    padding: '12px',
  },
  rewardsTitle: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
  },
});
