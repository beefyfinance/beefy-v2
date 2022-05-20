export const styles = theme => ({
  valueStrikethrough: {
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '18px',
    color: theme.palette.type === 'dark' ? '#8585A6' : '#A69885',
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'left',
    [theme.breakpoints.up('md')]: {
      textAlign: 'center',
    },
    textDecoration: 'line-through',
    '&.large': {
      color: '#8A8EA8',
      fontSize: '14px',
      lineHeight: '24px',
      letterSpacing: '0.2px',
      textDecorationLine: 'line-through',
    },
  },
  value: {
    fontWeight: 600,
    fontSize: '18px',
    lineHeight: '24px',
    margin: 0,
    padding: 0,
    letterSpacing: '0.2px',
    [theme.breakpoints.up('lg')]: {
      fontSize: '18px',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '18px',
      textAlign: 'left',
    },
    '&.large': {
      fontSize: '21px',
      lineHeight: '24px',
      color: theme.palette.text.secondary,
    },
  },
});
