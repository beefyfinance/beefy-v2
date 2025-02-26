import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  containerBoost: {
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.contentPrimary,
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
  containerExpired: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    padding: '24px',
    backgroundColor: theme.palette.background.contentPrimary,
    borderRadius: '12px',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
  containerExpiredBoosts: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
  },
  boostImg: {
    width: 30,
    height: 30,
    marginLeft: '-8px',
  },
  title: {
    ...theme.typography['h2'],
    color: theme.palette.background.vaults.boost,
    display: 'flex',
    alignItems: 'center',
  },
  titleWhite: {
    color: '#fff',
  },
  titleTooltipTrigger: {
    color: theme.palette.text.middle,
    marginLeft: '8px',
  },
  rewards: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    columnGap: '16px',
    backgroundColor: theme.palette.background.contentLight,
    color: theme.palette.text.middle,
    padding: '12px',
    borderRadius: '8px',
  },
  rewardLabel: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
    whiteSpace: 'nowrap' as const,
  },
  rewardValue: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    whiteSpace: 'nowrap' as const,
  },
  rewardsFadeInactive: {
    color: theme.palette.text.dark,
  },
  rewardValueActive: {
    color: theme.palette.text.middle,
  },
  rewardValueAmount: {
    minWidth: 0,
  },
  rewardEllipsis: {
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rewardSymbol: {
    marginLeft: '4px',
  },
  button: {
    borderRadius: '8px',
  },
});
