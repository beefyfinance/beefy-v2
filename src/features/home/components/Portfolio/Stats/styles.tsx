const styles = theme => ({
  stats: {
    display: 'flex',
  },
  stat: {
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      margin: '8px 32px 8px 0px',
    },
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
  blurred: {
    filter: 'blur(.5rem)',
  },
  obscured: {
    color: '#424866',
  },
});

export default styles;
