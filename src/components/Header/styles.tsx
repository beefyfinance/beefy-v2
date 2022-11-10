import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  navHeader: {
    background: 'transparent',
    boxShadow: 'none',
    '&:hover .MuiListItem-button': {
      background: 'transparent',
    },
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    columnGap: theme.spacing(2),
  },
  hasPortfolio: {
    backgroundColor: theme.palette.background.header,
  },
  userOnDashboard: {
    backgroundColor: theme.palette.background.alternativeFooterHeader,
  },
  container: {
    paddingTop: '12px',
    paddingBottom: '12px',
  },
  content: {
    justifyContent: 'space-between',
  },
  mobileMenu: {
    width: 250,
    backgroundColor: theme.palette.background.header,
  },
  beefy: {
    display: 'block',
    '& img': {
      height: '40px',
      display: 'block',
    },
  },
  bifiPrice: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    color: theme.palette.text.disabled,
    whiteSpace: 'nowrap' as const,
    textDecoration: 'none',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
    '& img': {
      height: '18px',
      marginRight: '5px',
    },
  },
  toggleDrawer: {
    background: 'transparent',
    padding: '3px',
    border: 0,
    boxShadow: 'none',
    color: theme.palette.text.primary,
    fontSize: '30px',
  },
  toggleDrawerIcon: {
    display: 'block',
  },
  drawerBlack: {
    backgroundColor: '#0D0E14',
  },
  hide: {
    display: 'none',
  },
});
