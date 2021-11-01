export const styles = theme => ({
  headerTabs: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginLeft: 'auto',
    [theme.breakpoints.up('lg')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    [theme.breakpoints.down('sm')]: {
      marginRight: 'auto',
      marginLeft: 0,
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
  titleBox: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
});
