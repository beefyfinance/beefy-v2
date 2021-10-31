const styles = theme => ({
  container: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      display: 'block',
    },
  },
  stats: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  stats2: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'flex-end',
    textAlign: 'end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
      textAlign: 'start',
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
  price: {
    color: '#9595B2',
    letterSpacing: '0.2px',
    fontSize: '14px',
    lineHeight: '18px',
  },
  tached: {
    color: '#9595B2',
    textDecorationLine: 'line-through',
    letterSpacing: '0.2px',
    fontSize: '14px',
    lineHeight: '18px',
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
