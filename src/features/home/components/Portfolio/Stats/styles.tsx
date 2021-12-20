export const styles = theme => ({
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
    color: theme.palette.text.primary,
  },
  label: {
    textTransform: 'uppercase',
    display: 'inline-flex',
    letterSpacing: '0.5px',
    fontWeight: 600,
    color: theme.palette.text.disabled,
  },
  blurred: {
    filter: 'blur(.5rem)',
  },
  obscured: {
    color: '#424866',
  },
});
