import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    marginTop: '32px',
    display: 'grid',
    gridTemplateColumns: '100%',
    rowGap: '48px',
    columnGap: '48px',
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
    backgroundColor: theme.palette.background.default,
    borderRadius: '8px',
    padding: '16px 16px',
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
    backgroundColor: theme.palette.background.default,
    borderRadius: '8px',
    padding: '16px 24px',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
      textAlign: 'start' as const,
    },
  },
  stat: {
    display: 'flex',
    width: '33%',
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(2),
    },
  },
  stat1: {
    paddingTop: 0,
    paddingBottom: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      marginRight: theme.spacing(4),
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
    marginRight: theme.spacing(3),
    width: 2,
    color: theme.palette.background.vaults.defaultOutline,
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(2.5),
    },
  },
  divider1: {
    width: 2,
    color: theme.palette.background.vaults.defaultOutline,
    marginLeft: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      marginRight: theme.spacing(2.5),
    },
  },
});
