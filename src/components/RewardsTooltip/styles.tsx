import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
  },
  tooltipTitle: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: '#73768C',
  },
  rewardsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '4px',
  },
  rewardsText: {
    ...theme.typography['body-lg-med'],
    color: '#363C63',
  },
  usdPrice: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: '#73768C',
  },
});
