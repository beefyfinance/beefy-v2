export const styles = theme => ({
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatars: {
    minHeight: '100vh',
    position: 'relative',
    backgroundColor: theme.palette.background.dark,
    backgroundImage: props => `url(${props.bgImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'bottom',
    backgroundSize: '100%',
    paddingBottom: '200px',
    opacity: 1,
  },
  card: {
    background: '#14182B',
    borderRadius: '16px',
    color: theme.palette.background.cta,
    width: '168px',
    height: '168px',
    maxWidth: '80%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: `2px solid ${theme.palette.background.cta}`,
    boxShadow: '-10px 10px 10px 0px #00000080',
  },
  title: {
    color: theme.palette.background.cta,
    fontWeight: 700,
    fontSize: '12px',
    lineHeight: '16px',
    textTransform: 'uppercase',
  },
  title2: {
    color: theme.palette.background.cta,
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: '24px',
    textTransform: 'uppercase',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
  text: {
    color: theme.palette.text.disabled,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
  bold: {
    color: '#FFF',
    fontWeight: 700,
    fontStyle: 'bold',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
      justifyContent: 'center',
    },
  },
  btnMint: {
    backgroundColor: theme.palette.background.cta,
    fontWeight: 'bold',
    fontSize: '16px',
    lineHeight: '24px',
    padding: '8px 24px',
    borderRadius: '8px',
    textTransform: 'none',
    [theme.breakpoints.down('sm')]: {
      width: '50%',
    },
  },
  btnMore: {
    marginRight: theme.spacing(2),
    color: theme.palette.text.disabled,
    backgroundColor: 'transparent',
    textTransform: 'none',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.background.cta}`,
    fontWeight: 'bold',
    fontSize: '16px',
    lineHeight: '24px',
    padding: '8px 24px',
    [theme.breakpoints.down('sm')]: {
      width: '50%',
    },
  },
  traitTitle: {
    color: theme.palette.background.cta,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  traitText: {
    color: theme.palette.background.muted,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
    '& span': {
      color: theme.palette.background.cta,
    },
  },
  divider: {
    '&.MuiDivider-vertical': {
      width: '2px',
      backgroundColor: '#3F466D',
    },
  },
  info: {
    textAlign: 'left',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
    },
  },
  autoGrid: {
    '&.MuiGrid-grid-lg-auto': {
      flexGrow: 1,
    },
  },
  trait: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: `${theme.spacing(1)}px 0`,
  },
});
