export const styles = theme => ({
  container: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      display: 'block',
    },
  },
  stats: {
    marginTop: theme.spacing(4),
    height: 96,
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: theme.palette.background.default,
    borderRadius: '8px',
    padding: '16px 16px',
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(3),
    },
  },
  stats2: {
    marginTop: theme.spacing(4),
    height: 96,
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    textAlign: 'end',
    backgroundColor: theme.palette.background.default,
    borderRadius: '8px',
    padding: '16px 24px',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
      textAlign: 'start',
      marginTop: 0,
    },
  },
  stat: {
    display: 'flex',
    width: '33%',
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(2),
    },
  },
  stat1: {
    paddingTop: 0,
    paddingBottom: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      marginRight: theme.spacing(4),
      justifyContent: 'flex-start',
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
    marginRight: theme.spacing(3),
    width: 2,
    color: theme.palette.background.vaults.defaultOutline,
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(2.5),
    },
  },
  divider1: {
    width: 2,
    color: theme.palette.background.vaults.defaultOutline,
    marginLeft: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      marginRight: theme.spacing(2.5),
    },
  },
});
