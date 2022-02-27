export const styles = theme => ({
  navHeader: {
    paddingTop: '20px',
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
  mobileMenu: {
    width: 250,
    backgroundColor: theme.palette.background.header,
  },
  beefy: {
    '& a': {
      marginLeft: '10px',
      [theme.breakpoints.down('md')]: {
        marginLeft: '5px',
      },
    },
    '& img': {
      height: '34px',
    },
  },
  navLink: {
    textDecoration: 'none',
    textTransform: 'capitalize',
    color: theme.palette.text.disabled,
    fontWeight: 'bold',
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0.1px',
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
    flexDirection: 'column',
  },
  active: {
    color: theme.palette.text.primary,
  },
  bifiPrice: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
    '& img': {
      height: '18px',
      marginRight: '5px',
    },
    '& .MuiTypography-root': {
      fontWeight: 700,
      color: theme.palette.text.disabled,
    },
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
