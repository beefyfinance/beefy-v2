const styles = theme => ({
  itemContainer: {
    display: 'flex',
    flexDirection: 'column',
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
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
  dataGrid: {
    [theme.breakpoints.up('md')]: {
      paddingRight: 18,
    },
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      margin: '0 10px',
    },
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'space-around',
    justifyContent: 'center',
    [theme.breakpoints.up('md')]: {
      alignItems: 'flex-start',
    },
  },
  infoContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '& .MuiAvatar-root:not(.MuiAvatarGroup-avatar)': {
      margin: '10px 10px 0 20px',
    },
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
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
    [theme.breakpoints.down('md')]: {
      fontSize: '15px',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '24px',
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
    textAlign: 'left',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
  centerSpace: {
    padding: '0.5rem 0',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      padding: '0.5rem 1rem 0.5rem 0',
    },
  },
  chart: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  depositButton: {
    border: 'solid 2px #54995C',
    backgroundColor: '#54995C',
    borderRadius: '30px',
    color: 'white',
    fontSize: '18px',
    fontWeight: 700,
    padding: '2px 20px 2px',
    textTransform: 'capitalize',
    marginTop: '10px',
    display: 'block',
  },
  apyContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: '0px 0px 20px 20px',
    background: theme.palette.type === 'dark' ? '#313759' : '#faf6f1',
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
    [theme.breakpoints.up('md')]: {
      width: '275px',
      flexDirection: 'column',
      borderRadius: '0px 20px 20px 0px',
    },
  },
  btnSeeDetails: {
    fontSize: '14px',
    lineHeight: '14px',
    fontWeight: 600,
    color: '#6B7199',
    backgroundColor: '#232743',
    letterSpacing: '0.5px',
    textTransform: 'inherit',
    borderRadius: '20px',
    padding: '5px 15px 5px',
  },
  badgesContainter: {
    display: 'block',
    margin: '0 10px 0 70px',
    [theme.breakpoints.down('sm')]: {
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
  },
  leftCenter: {
    textAlign: 'left',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '50%',
    [theme.breakpoints.up('md')]: {
      width: 'auto',
    },
  },
  safetyLabel: {
    display: 'flex',
    alignItems: 'center',
  },
});

export default styles;
