const styles = theme => ({
  stats: {
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  },
  stat: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginRight: theme.spacing(2),
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
  obscured: {
    color: '#424866',
  },
});

export default styles;
