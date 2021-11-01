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
    alignItem: 'center',
  },
  hasPortfolio: {
    backgroundColor: theme.palette.type === 'dark' ? '#0D0E14' : '#fff',
  },
  mobileMenu: {
    width: 250,
    backgroundColor: theme.palette.type === 'dark' ? '#14161F' : '#FEFAF4',
  },
  beefy: {
    display: 'flex',
    paddingTop: '4px',
    letterSpacing: 'unset',
    '& div': {
      color: 'white',
      marginLeft: '10px',
      fontSize: '20px',
      fontWeight: '700',
      textDecoration: 'none',
    },
    '&,& .MuiButton-root': {
      textDecoration: 'none',
      '&:hover, &:focus': {
        color: theme.palette.text.primary,
        background: 'transparent',
      },
    },
    '& a': {
      marginLeft: '10px',
    },
    '& img': {
      height: '24px',
    },
  },
  navLink: {
    textDecoration: 'none',
    textTransform: 'capitalize',
    color: theme.palette.type === 'dark' ? '#6B7199' : '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: '24px',
    margin: theme.spacing(3),
    '&:hover': {
      color: 'white',
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
  },
  navMobile: {
    display: 'flex',
    flexDirection: 'column',
  },
  active: {
    color: '#fff',
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
      fontWeight: '600',
      fontSize: 16,
      color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
    },
  },
  drawerBlack: {
    backgroundColor: theme.palette.type === 'dark' ? '#0D0E14' : '#fff',
  },
  hide: {
    display: 'none',
  },
});
