export const styles = theme => ({
  tooltip: {
    fontSize: 14,
  },
  label: {
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '20px',
    color: theme.palette.text.disabled,
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'left',
    [theme.breakpoints.up('md')]: {
      textAlign: 'center',
    },
  },
  statLabel: {
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '18px',
    color: theme.palette.text.disabled,
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'left',
    [theme.breakpoints.up('md')]: {
      textAlign: 'center',
    },
  },
  value: {
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '18px',
    color: theme.palette.type === 'dark' ? '#565B81' : '#A69885',
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'rigth',
  },
  rows: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& div': {
      margin: '5px 0px',
    },
  },
  bold: {
    fontWeight: 'bold',
    fontSize: '14px',
    lineHeight: '18px',
    color: theme.palette.type === 'dark' ? '#272B4A' : '#A69885',
    letterSpacing: '0.2px',
    textTransform: 'none',
  },
  centerSpace: {
    padding: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      padding: '0.5rem 32px 0.5rem 32px',
      justifyContent: 'space-around',
      flexGrow: '0',
      maxWidth: '15%',
      flexBasis: '15%',
    },
    [theme.breakpoints.down('sm')]: {
      height: 60,
      margin: '8px 0',
      flexGrow: '0',
      maxWidth: '50%',
      flexBasis: '50%',
    },
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    [theme.breakpoints.up('md')]: {
      alignItems: 'center',
    },
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      margin: '10px 0',
    },
  },
  stat1: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    [theme.breakpoints.up('md')]: {
      alignItems: 'center',
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: '10px',
      alignItems: 'flex-start',
    },
  },
  tooltipLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  tooltipHolder: {
    marginLeft: theme.spacing(0.5),
  },
  boostSpacer: {
    [theme.breakpoints.up('md')]: {
      height: 18,
    },
    [theme.breakpoints.down('sm')]: {
      height: 20,
    },
  },
});
