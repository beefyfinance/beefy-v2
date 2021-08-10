const styles = theme => ({
  itemContainer: {
    margin: '20px 0 0 0',
    borderRadius: '20px',
    padding: 0,
    width: '100%',
    background: theme.palette.type === 'dark' ? '#272B4A' : '#faf6f1',
    '&:hover': {
      background: theme.palette.type === 'dark' ? '#272B4A' : '#faf6f1',
    },
    '&.hasDeposit': {
      background: theme.palette.type === 'dark' ? '#313759' : '#faf6f1',
      '&:hover': {
        background: theme.palette.type === 'dark' ? '#313759' : '#faf6f1',
      },
    },
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
  },
  titleContainer: {
    paddingTop: '5px',
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  infoContainer: {
    '& .MuiAvatar-root:not(.MuiAvatarGroup-avatar)': {
      margin: '0 10px 0 20px',
    },
  },
  vaultName: {
    fontWeight: 600,
    fontSize: '24px',
    lineHeight: '36px',
    margin: 0,
    padding: 0,
    [theme.breakpoints.up('lg')]: {
      fontSize: '27px',
    },
  },
  value: {
    fontWeight: 600,
    fontSize: '18px',
    lineHeight: '36px',
    margin: 0,
    padding: 0,
    [theme.breakpoints.up('lg')]: {
      fontSize: '24px',
    },
  },
  label: {
    fontWeight: 400,
    fontSize: '15px',
    lineHeight: '24px',
    color: '#8585A6',
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
  },
  center: {
    padding: '0.5rem 0.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSpace: {
    padding: '0.5rem 1rem',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    textAlign: 'center',
  },
  chart: {
    padding: '5px',
  },
  depositButton: {
    border: 'solid 2px #54995C',
    backgroundColor: '#54995C',
    borderRadius: '30px',
    marginLeft: '10px',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
    padding: '4px 19px',
    textTransform: 'capitalize',
    marginTop: '10px',
    display: 'block',
  },
  apyContainer: {
    background: theme.palette.type === 'dark' ? '#313759' : '#faf6f1',
    borderRadius: '0px 20px 20px 0px',
    padding: '20px 0',
    '& .MuiTypography-h1': {
      fontWeight: 600,
      fontSize: '30px',
      lineHeight: '34px',
    },
    '& .MuiTypography-h2': {
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: '24px',
      color: '#8585A6',
    },
    '&.hasDeposit': {
      background: theme.palette.type === 'dark' ? '#3F466D' : '#faf6f1',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderRadius: '0px 0px 20px 20px',
    },
  },
});

export default styles;
