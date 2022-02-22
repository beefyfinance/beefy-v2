export const styles = theme => ({
  statLabel: {
    fontWeight: 400,
    fontSize: '14px',
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
});
