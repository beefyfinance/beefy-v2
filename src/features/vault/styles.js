const styles = theme => ({
  vaultContainer: {
    padding: '40px 0',
    backgroundColor: theme.palette.type === 'dark' ? '#0D0E14' : '#fff',
  },
  title: {
    display: 'flex',
    marginBottom: '8px',
    '& .MuiTypography-h1': {
      fontSize: '36px',
      lineHeight: '52px',
      fontWeight: 600,
      paddingLeft: '12px',
      letterSpacing: '-0.1px',
    },
    '& .MuiAvatar-root:not(.MuiAvatarGroup-avatar)': {
      width: 48,
      height: 48,
    },
  },
  summaryContainer: {
    padding: '10px 0',
    '& .MuiTypography-h1': {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '30px',
      color: '#ffffff',
      [theme.breakpoints.up('md')]: {
        fontSize: '24px',
      },
    },
    '& .MuiTypography-body2': {
      fontSize: '12px',
      fontWeight: 400,
      color: '#8585A6',
      letterSpacing: '0.2px',
      [theme.breakpoints.up('md')]: {
        fontSize: '15px',
      },
    },
    '& .MuiDivider-root': {
      width: '1px',
      height: '21px',
      borderColor: '#3F4465',
      margin: '0 15px',
      [theme.breakpoints.up('lg')]: {
        margin: '0 30px',
      },
    },
    '& .MuiBox-root': {
      padding: '0 5px 0 5px',
    },
  },
  network: {
    textTransform: 'uppercase',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  paper: {
    backgroundColor: '#272B4A',
    marginTop: '20px',
    padding: '20px',
    borderRadius: '20px',
  },
  dw: {
    backgroundColor: '#272B4A',
    borderRadius: '20px',
  },
  customOrder: {
    order: 1,
  },
  tabs: {
    backgroundColor: '#14182B',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    '& .MuiButton-root': {
      fontSize: '16px',
      fontWeight: 600,
      letterSpacing: '0.1px',
      textTransform: 'capitalize',
      color: '#6B7199',
      background: 'none',
      width: '50%',
      padding: 0,
      margin: 0,
      height: '60px',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      '&:hover': {
        background: 'none',
      },
    },
  },
  selected: {
    color: '#ffffff !important',
    borderBottom: 'solid 3px #3F466D',
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    '& img': {
      height: '24px',
      marginRight: '4px',
    },
  },
  platformContainer: {
    display: 'flex',
    marginTop: '8px',
  },
  platformValue: {
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  platformLabel: {
    fontWeight: 600,
    fontSize: '12px',
    color: theme.palette.type === 'dark' ? '#8585A6' : '#A69885',
  },
});

export default styles;
