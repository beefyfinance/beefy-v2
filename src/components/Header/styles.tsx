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
  },
  hasPortfolio: {
    backgroundColor: theme.palette.background.header,
  },
  container: {
    paddingTop: '12px',
    paddingBottom: '12px',
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
  navLink: {
    ...theme.typography['body-lg-med'],
    textDecoration: 'none',
    color: theme.palette.text.disabled,
    margin: '12px',
    '&:hover': {
      color: theme.palette.text.primary,
      cursor: 'pointer',
    },
    [theme.breakpoints.up('md')]: {
      '&:hover': {
        '& .MuiTypography-root': {
          borderColor: 'white',
        },
      },
    },
    [theme.breakpoints.down('md')]: {
      margin: '16px',
    },
    '& a': {
      textDecoration: 'none',
      color: theme.palette.text.disabled,
      '&:hover': {
        color: theme.palette.text.primary,
      },
    },
  },
  navMobile: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  active: {
    color: theme.palette.text.primary,
  },
  bifiPrice: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: theme.spacing(3),
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
  chain: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.disabled,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
      marginRight: theme.spacing(2),
    },
    '& img': {
      height: '18px',
      marginRight: '5px',
    },
  },
  toggleDrawer: {
    background: 'transparent',
    margin: '0 0 0 16px',
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
  walletContainer: {
    minWidth: '195px',
    minHeight: '10px',
    display: 'block',
    paddingLeft: '24px',

    [theme.breakpoints.down('xs')]: {
      minWidth: '165px',
      paddingLeft: '16px',
    },
  },
});
