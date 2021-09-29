const styles = theme => ({
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
    fontSize: 18,
    fontWeight: 'bold',
    margin: theme.spacing(2),
    '& .MuiTypography-root': {
      fontSize: 18,
      fontWeight: 'bold',
    },
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
      margin: 0,
    },
  },
  hide: {
    display: 'none',
  },
});

export default styles;
