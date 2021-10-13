const styles = theme => ({
  headerTabs: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginLeft: 'auto',
    [theme.breakpoints.up('lg')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  headerTab: {
    marginTop: 10,
    '& .MuiTabs-root': {
      minHeight: '38px',
    },
    '& .MuiTab-root': {
      minHeight: '34px',
    },
    [theme.breakpoints.up('lg')]: {
      marginTop: 0,
      marginLeft: 20,
    },
  },
});

export default styles;
