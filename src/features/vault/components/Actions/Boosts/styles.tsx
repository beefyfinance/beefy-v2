import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  containerBoost: {
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.contentPrimary,
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
  },
  containerExpired: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    padding: '24px',
    backgroundColor: theme.palette.background.contentPrimary,
    borderRadius: '12px',
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
  boostStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: '16px',
    backgroundColor: theme.palette.background.contentLight,
    padding: '12px',
    borderRadius: '8px',
  },
  boostStat: {
    '& :last-child': {
      marginBottom: 0,
    },
  },
  boostStatLabel: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
  },
  boostStatValue: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
  },
  button: {
    borderRadius: '8px',
  },
});
