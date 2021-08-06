const styles = theme => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4rem 0 2rem',
  },
  h1: {
    fontSize: '3rem',
    fontWeight: '600',
    lineHeight: '54px',
    color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
  },
  tvl: {
    fontSize: '2rem',
    fontWeight: '600',
  },
  tvlLabel: {
    display: 'inline',
    color: theme.palette.type === 'dark' ? '#8585A6' : '#ff0000',
  },
  tvlValue: {
    display: 'inline',
    color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
  },
  numberOfVaults: {
    marginTop: 20,
    textTransform: 'uppercase',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '18px',
    letterSpacing: '1px',
  },
  h2: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: '36px',
    margin: 0,
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      fontSize: '16px',
    },
    [theme.breakpoints.up('lg')]: {
      fontSize: '27px',
    },
  },
  h3: {
    fontWeight: 400,
    fontSize: '15px',
    lineHeight: '24px',
    color: '#8585A6',
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
  },
  rWidth: {
    minWidth: '80px',
    padding: '20px',
    [theme.breakpoints.up('sm')]: {
      minWidth: '100px',
    },
    [theme.breakpoints.up('md')]: {
      minWidth: '140px',
    },
    [theme.breakpoints.up('lg')]: {
      minWidth: '170px',
    },
  },
  apyContainer: {
    textAlign: 'center',
    padding: '25px 50px',
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
    '& .MuiTypography-button': {
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
  },
  infoContainer: {
    '& .MuiAvatar-root:not(.MuiAvatarGroup-avatar)': {
      marginLeft: '20px',
    },
  },
  title: {
    padding: '0 10px',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
  },
  mobileCard: {
    margin: '20px 0 0 0',
    borderRadius: '20px',
    padding: 0,
    width: '100%',
    background: theme.palette.type === 'dark' ? '#272B4A' : '#faf6f1',
    '&:hover': {
      background: theme.palette.type === 'dark' ? '#272B4A' : '#faf6f1',
    },
  },
  titleContainer: {
    paddingTop: '5px',
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
    },
  },
  center: {
    padding: '0.5rem 0.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  apyMobile: {
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
    display: 'block',
    background: theme.palette.type === 'dark' ? '#313759' : '#faf6f1',
    borderRadius: '0px 20px 20px 0px',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderRadius: '0px 0px 20px 20px',
    },
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
  btnGoBack: {
    fontSize: '14px',
    lineHeight: '14px',
    fontWeight: 600,
    color: '#6B7199',
    backgroundColor: '#14182B',
    letterSpacing: '0.5px',
    textTransform: 'inherit',
    borderRadius: '20px',
    padding: '5px 15px 5px ',
  },
});

export default styles;
