import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
  },
  statuses: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '8px',
  },
  sources: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '8px',
  },
  source: {},
  sourceTitle: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.tooltip.title,
  },
  rewards: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '4px',
  },
  rewardsText: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.tooltip.value,
  },
  usdPrice: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.tooltip.label,
  },
});
