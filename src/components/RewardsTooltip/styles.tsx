import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
  },
  tooltipTitle: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.tooltips,
  },
  rewardsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '4px',
  },
  rewardsText: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.tooltipsValue,
  },
  usdPrice: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.tooltips,
  },
});
