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
  titleHolder: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '8px',
  },
  title: {
    flex: '1 1 auto',
  },
  refresh: {
    flex: '0 0 auto',
  },
});
