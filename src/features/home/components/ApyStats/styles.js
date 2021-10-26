const styles = theme => ({
  tooltip: {
    fontSize: 14,
  },
  label: {
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '20px',
    color: theme.palette.type === 'dark' ? '#8585A6' : '#A69885',
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
      flexGrow: '0',
      maxWidth: '50%',
      flexBasis: '50%',
    },
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    [theme.breakpoints.up('md')]: {
      width: 'auto',
      alignItems: 'center',
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

export default styles;
