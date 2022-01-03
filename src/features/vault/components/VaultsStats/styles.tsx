export const styles = theme => ({
  container: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      display: 'block',
    },
  },
  stats: {
    marginTop: '32px',
    height: 96,
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: theme.palette.background.default,
    borderRadius: '8px',
    padding: '16px 24px',
  },
  stats2: {
    marginTop: '32px',
    height: 96,
    display: 'flex',
    justifyContent: 'flex-end',
    textAlign: 'end',
    backgroundColor: theme.palette.background.default,
    borderRadius: '8px',
    padding: '16px 24px',
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
  stat1: {
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      marginRight: theme.spacing(4),
    },
  },

  value: {
    color: theme.palette.text.secondary,
  },
  price: {
    color: theme.palette.text.disabled,
    letterSpacing: '0.5px',
    fontSize: '12px',
    lineHeight: '20px',
  },
  tached: {
    color: theme.palette.text.disabled,
    textDecorationLine: 'line-through',
    letterSpacing: '0.2px',
    fontSize: '14px',
    lineHeight: '18px',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '20px',
    display: 'inline-flex',
    color: theme.palette.text.disabled,
  },
  obscured: {
    color: '#424866',
  },
  divider: {
    marginRight: theme.spacing(4),
    width: 2,
    color: theme.palette.background.vaults.defaultOutline,
  },
  divider1: {
    marginLeft: theme.spacing(4),
    width: 2,
    color: theme.palette.background.vaults.defaultOutline,
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      marginRight: theme.spacing(4),
    },
  },
});
