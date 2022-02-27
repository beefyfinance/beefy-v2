export const styles = theme => ({
  value: {
    fontWeight: 600,
    fontSize: '18px',
    margin: 0,
    padding: 0,
    whiteSpace: 'nowrap',
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
  label: {
    fontWeight: 600,
    fontSize: '12px',
    color: theme.palette.text.disabled,
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'left',
    [theme.breakpoints.up('md')]: {
      textAlign: 'center',
    },
    '&.large': {
      lineHeight: '20px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },
  },
  price: {
    color: theme.palette.text.disabled,
    fontWeight: 400,
    letterSpacing: '0.2px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  blurred: {
    filter: 'blur(.5rem)',
  },
  tooltipLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  tooltipHolder: {
    marginLeft: theme.spacing(0.5),
  },
  noTextContentLoader: {
    paddingTop: '3px',
  },
});
