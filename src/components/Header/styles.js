const styles = theme => ({
  navHeader: {
    paddingTop: '20px',
    background: 'transparent',
    boxShadow: 'none',
    '&:hover .MuiListItem-button': {
      background: 'transparent',
    },
  },
  hasPortfolio: {
    backgroundColor: theme.palette.type === 'dark' ? '#0D0E14' : '#fff',
  },
  navDisplayFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: 0,
  },
  mobileMenu: {
    width: 250,
  },
  beefy: {
    display: 'flex',
    paddingTop: '4px',
    letterSpacing: 'unset',
    alignItems: 'center',
    justifyContent: 'center',
    '&,& .MuiButton-root': {
      fontSize: '20px',
      fontWeight: '700',
      borderRadius: '3px',
      textTransform: 'none',
      whiteSpace: 'nowrap',
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
    '& .MuiTypography-root': {
      fontSize: 18,
      fontWeight: 'bold',
      borderBottom: '3px solid transparent',
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
  },
  hide: {
    display: 'none',
  },
});

export default styles;
