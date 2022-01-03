export const styles = theme => ({
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
    color: theme.palette.primary.main,
    fontFamily: 'Proxima Nova',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '18px',
    lineHeight: '24px',
    textAlign: 'center',
    letterSpacing: '-0.1px',
  },
  bar: {
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.primary.main : '#A69885',
    width: '5px',
    borderRadius: '2px',
    '& + $bar': {
      marginLeft: '4px',
    },
  },
  sm: {
    height: '11px',
  },
  md: {
    height: '14px',
  },
  lg: {
    height: '19px',
  },
  withSizeLarge: {
    marginBottom: '5px',
    '& $label': {
      fontSize: '36px',
      lineHeight: '30px',
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
  withSizeMedium: {
    marginBottom: '5px',
    '& $label': {
      fontSize: '24px',
      lineHeight: '24px',
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
      color: theme.palette.primary.main,
    },
    '& $sm': {
      backgroundColor: theme.palette.primary.main,
    },
    '& $md': {
      backgroundColor: theme.palette.primary.main,
    },
    '& $lg': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  withWhiteLabel: {
    '& $label': {
      color: theme.palette.type === 'dark' ? '#ffffff' : '#000',
    },
  },
});
