import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  containerBoost: {
    padding: theme.spacing(3),
    borderRadius: '12px',
    backgroundColor: theme.palette.background.v2.contentPrimary,
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
  },
  containerExpired: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    padding: '24px',
    backgroundColor: theme.palette.background.v2.contentPrimary,
    borderRadius: '12px',
    marginTop: theme.spacing(3),
  },
  boostImg: {
    width: 30,
    height: 30,
    marginLeft: '-8px',
  },
  title: {
    ...theme.typography['h2'],
    color: '#E88225',
    display: 'flex',
    alignItems: 'center',
  },
  titleWhite: {
    color: '#fff',
  },
  titleTooltipTrigger: {
    color: theme.palette.text.secondary,
    fontSize: '20px',
    width: '20px',
    height: '20px',
    marginLeft: '8px',
    '& .MuiSvgIcon-root': {
      fontSize: 'inherit',
      display: 'block',
    },
  },
  boostStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: '16px',
    backgroundColor: theme.palette.background.v2.contentLight,
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
    color: theme.palette.text.disabled,
  },
  boostStatValue: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
  },
  button: {
    backgroundColor: theme.palette.background.vaults.boost,
    borderRadius: '8px',
  },
});
