const styles = theme => ({
  container: {
    width: '95%',
    height: 44,
    borderRadius: 30,
    '& .MuiTypography-root': {
      fontWeight: 'bold',
      fontSize: 18,
    },
    '& .MuiGrid-container': {
      flexWrap: 'nowrap',
      padding: '8px 19px 0px 19px',
      cursor: 'pointer',
    },
    [theme.breakpoints.up('md')]: {
      width: '100%',
    },
  },
  disconnected: {
    display: 'flex',
    justifyContent: 'center',
    border: 'solid 2px #54995C',
    backgroundColor: '#54995C',
    '& .MuiGrid-container': {
      color: 'white',
    },
  },
  connected: {
    border: theme.palette.type === 'dark' ? '2px solid #313759' : '2px solid #ff0000',
    '& .MuiAvatar-root': {
      height: '24px',
      width: '24px',
      marginRight: '8px',
    },
    '& .MuiGrid-container': {
      color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
    },
    '&:hover': {
      borderColor: theme.palette.type === 'dark' ? '#3F466D' : '#6B7199',
    },
    '&:hover .MuiGrid-container': {
      color: theme.palette.type === 'dark' ? '#8585A6' : '#ff0000',
    },
  },
  loading: {
    paddingTop: '4px',
  },
});

export default styles;
