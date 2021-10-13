const styles = theme => ({
  container: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: '5px',
  },
  barsContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    margin: 'auto auto 3px 10px',
  },
  label: {
    color: '#424866',
    fontFamily: 'Proxima Nova',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '18px',
    lineHeight: '24px',
    textAlign: 'center',
    letterSpacing: '-0.1px',
  },
  bar: {
    backgroundColor: theme.palette.type === 'dark' ? '#424866' : '#A69885',
    width: '5px',
    borderRadius: '2px',
    '& + $bar': {
      marginLeft: '4px',
    },
  },
  sm: {
    height: '9px',
  },
  md: {
    height: '17px',
  },
  lg: {
    height: '25px',
  },
  withSizeLarge: {
    marginBottom: '5px',
    '& $label': {
      fontSize: '36px',
      lineHeight: '30px',
      [theme.breakpoints.up('lg')]: {
        fontSize: '36px',
      },
    },
    '& $sm': {
      height: '13px',
    },
    '& $md': {
      height: '21px',
    },
    '& $lg': {
      height: '29px',
    },
  },
  withScoreLow: {
    '& $label': {
      color: '#E84525',
    },
    '& $sm': {
      backgroundColor: '#E84525',
    },
  },
  withScoreMed: {
    '& $label': {
      color: '#E88225',
    },
    '& $sm': {
      backgroundColor: '#E88225',
    },
    '& $md': {
      backgroundColor: '#E88225',
    },
  },
  withScoreHigh: {
    '& $label': {
      color: '#4A9252',
    },
    '& $sm': {
      backgroundColor: '#4A9252',
    },
    '& $md': {
      backgroundColor: '#4A9252',
    },
    '& $lg': {
      backgroundColor: '#4A9252',
    },
  },
  withWhiteLabel: {
    '& $label': {
      color: theme.palette.type === 'dark' ? '#ffffff' : '#000',
    },
  },
});

export default styles;
