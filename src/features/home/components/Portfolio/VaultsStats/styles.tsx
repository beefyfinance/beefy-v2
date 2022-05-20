export const styles = theme => ({
  stats: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& div:last-child': {
      marginRight: '0',
    },
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
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
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    display: 'inline-flex',
    fontWeight: 600,
    color: theme.palette.text.disabled,
  },
  obscured: {
    color: '#424866',
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginLeft: theme.spacing(0.5),
    '&:Hover': {
      cursor: 'pointer',
    },
  },
  backdrop: {
    backgroundColor: 'rgba(255,255,255,0.2) !important',
    backdropFilter: 'blur(8px)',
  },
});
