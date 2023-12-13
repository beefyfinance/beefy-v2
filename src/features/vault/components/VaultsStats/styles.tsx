import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  stats: {
    display: 'grid',
    gridTemplateColumns: '100%',
    rowGap: '24px',
    columnGap: '24px',
    [theme.breakpoints.up('lg')]: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,666fr) minmax(0,333fr)',
    },
  },
  interestStats: {
    width: '100%',
  },
  interestStatsBox: {
    height: 96,
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: theme.palette.background.contentDark,
    borderRadius: '8px',
    padding: '16px 24px',
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  depositStats: {
    width: '100%',
  },
  depositStatsBox: {
    height: 96,
    display: 'flex',
    flexWrap: 'nowrap' as const,
    justifyContent: 'flex-end',
    textAlign: 'end' as const,
    backgroundColor: theme.palette.background.contentDark,
    borderRadius: '8px',
    padding: '16px 24px',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
      textAlign: 'start' as const,
      padding: '16px',
    },
  },
  stat: {
    display: 'flex',
    width: '33%',
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: '32px',
    [theme.breakpoints.down('md')]: {
      marginRight: '16px',
    },
  },
  stat1: {
    paddingTop: 0,
    paddingBottom: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      marginRight: '32px',
      justifyContent: 'flex-start',
    },
  },
  stat3: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  stat4: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-start',
    },
  },
  divider: {
    marginRight: '24px',
    width: 2,
    backgroundColor: theme.palette.background.buttons.button,
    [theme.breakpoints.down('sm')]: {
      marginRight: '20px',
    },
  },
  divider1: {
    width: 2,
    backgroundColor: theme.palette.background.buttons.button,
    marginLeft: '24px',
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      marginRight: '20px',
    },
  },
});
