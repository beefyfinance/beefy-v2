export const styles = theme => ({
  vaultContainer: {
    padding: '42px 0px 16px 0px',
  },
  contentContainer: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(5),
  },
  title: {
    display: 'flex',
    marginBottom: '8px',
    alignItems: 'center',
    flexGrow: 1,
    '& .MuiTypography-h2': {
      color: theme.palette.text.secondary,
      paddingLeft: '12px',
    },
  },
  summaryContainer: {
    padding: '10px 0',
    '& .MuiTypography-h1': {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '30px',
      color: '#ffffff',
      [theme.breakpoints.up('md')]: {
        fontSize: '24px',
      },
    },
    '& .MuiTypography-body2': {
      fontSize: '12px',
      fontWeight: 400,
      color: '#8585A6',
      letterSpacing: '0.2px',
      [theme.breakpoints.up('md')]: {
        fontSize: '15px',
      },
    },
    '& .MuiDivider-root': {
      width: '1px',
      height: '21px',
      borderColor: '#3F4465',
      margin: '0 15px',
      [theme.breakpoints.up('lg')]: {
        margin: '0 30px',
      },
    },
    '& .MuiBox-root': {
      padding: '0 5px 0 5px',
    },
  },
  network: {
    textTransform: 'uppercase',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  paper: {
    backgroundColor: '#272B4A',
    marginTop: '20px',
    padding: '20px',
    borderRadius: '12px',
  },
  dw: {
    backgroundColor: '#272B4A',
    borderRadius: '12px',
  },
  columnActions: {
    '& > :first-child': {
      marginTop: 0,
    },
    [theme.breakpoints.up('md')]: {
      order: 1,
    },
  },
  columnInfo: {
    marginTop: '-24px',
    '& > :first-child': {
      marginTop: 0,
    },
    [theme.breakpoints.up('md')]: {
      marginTop: 0,
    },
  },
  tabs: {
    backgroundColor: theme.palette.background.vaults.inactive,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    '& .MuiButton-root': {
      fontSize: '16px',
      fontWeight: 600,
      letterSpacing: '0.1px',
      textTransform: 'capitalize',
      color: theme.palette.text.disabled,
      background: 'none',
      width: '50%',
      padding: 0,
      margin: 0,
      height: '60px',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      '&:hover': {
        background: 'none',
      },
    },
  },
  selected: {
    color: `${theme.palette.text.primary} !important`,
    borderBottom: `solid 2px ${theme.palette.text.disabled}`,
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    '& img': {
      height: '24px',
      marginRight: '4px',
    },
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
  },
  platformContainer: {
    display: 'flex',
    marginTop: '8px',
  },
  platformValue: {
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  platformLabel: {
    fontWeight: 600,
    fontSize: '12px',
    color: theme.palette.text.disabled,
    '& span': {
      fontWeight: 600,
      fontSize: '12px',
      color: theme.palette.text.primary,
      textTransform: 'uppercase',
    },
  },
  header: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      display: 'block',
    },
  },
  chainContainer: {
    marginRight: theme.spacing(4),
  },
  retirePauseReason: {
    marginBottom: '24px',
  },
});
