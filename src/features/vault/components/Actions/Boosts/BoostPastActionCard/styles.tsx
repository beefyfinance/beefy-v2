import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  title: {
    marginBottom: '0',
    display: 'flex',
  },
  expiredBoostName: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.light,
  },
  expiredBoostContainer: {
    background: theme.palette.background.contentLight,
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    gap: '12px',
    flexDirection: 'column' as const,
  },
  pastRewards: {
    padding: 0,
  },
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
  },
  value: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
});
