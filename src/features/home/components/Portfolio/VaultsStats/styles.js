const styles = theme => ({
  stats: {
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  },
  stat: {
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: theme.spacing(4),
  },
  value: {
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '30px',
    color: theme.palette.type === 'dark' ? '#ffffff' : '#ff0000',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: '18px',
    display: 'inline-flex',
    color: theme.palette.type === 'dark' ? '#8585A6' : '#ff0000',
  },
  obscured: {
    color: '#424866',
  },
});

export default styles;
