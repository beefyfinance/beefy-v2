export const styles = theme => ({
  container: {
    width: '95%',
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: '24px',
    '& .MuiTypography-root': {
      fontWeight: 'bold',
      fontSize: 16,
    },
    '& .MuiGrid-container': {
      flexWrap: 'nowrap',
      padding: '8px 24px',
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
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0) 100%)',
    // eslint-disable-next-line no-dupe-keys
    background: '#54995C26',
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
