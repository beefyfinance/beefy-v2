const styles = theme => ({
  stats: {
    display: 'flex',
  },
  stat: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(5),
    paddingLeft: theme.spacing(0),
    [theme.breakpoints.up('md')]: {
      paddingRight: theme.spacing(0),
      paddingLeft: theme.spacing(5),
    },
  },
  value: {
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '30px',
    color: theme.palette.type === 'dark' ? '#ffffff' : '#ff0000',
  },
  label: {
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '24px',
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
