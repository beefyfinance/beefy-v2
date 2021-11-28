export const styles = theme => ({
  itemContainer: {
    [theme.breakpoints.up(1300)]: {
      minWidth: '1180px',
    },
    display: 'flex',
    flexDirection: 'column',
    margin: '20px 0 0 0',
    borderRadius: '20px',
    padding: '24px',
    width: '100%',
    border: '2px solid #383E6B',
    boxShadow: '0px 1px 8px rgba(0,0,0,0.1)',
    background: theme.palette.type === 'dark' ? '#272B4A' : '#FFF',
    '&.hasDeposit': {
      background: '#313759',
      '&:hover': {
        background: '#313759',
      },
    },
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
    [theme.breakpoints.only('sm')]: {
      marginRight: '12px',
      marginLeft: '12px',
      width: 'calc(100% - 24px)',
      height: '470px',
    },
  },
  dataGrid: {},
  badges: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& img': {
      height: '24px',
    },
    [theme.breakpoints.down('sm')]: {
      margin: '0 -40px',
    },
    width: 'fit-content',
  },
  titleContainer: {
    display: 'flex',
    padding: '8px 0 8px 0',
    flexDirection: 'row',
    alignItems: 'space-around',
    justifyContent: 'center',
    [theme.breakpoints.up('md')]: {
      alignItems: 'flex-start',
      flexGrow: '0',
      maxWidth: '30%',
      flexBasis: '30%',
    },
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexGrow: '0',
      maxWidth: '100%',
      flexBasis: '100%',
    },
  },
  imageContainer: {
    paddingRight: '16px',
  },
  infoContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      alignItems: 'baseline',
    },
    '& .MuiAvatar-root:not(.MuiAvatarGroup-avatar)': {
      marginRight: '8px',
      height: 60,
      width: 60,
      [theme.breakpoints.down('sm')]: {
        height: 32,
        width: 32,
        marginRight: '0',
      },
    },
  },
  vaultName: {
    fontWeight: 600,
    fontSize: '24px',
    lineHeight: '36px',
    margin: 0,
    padding: 0,
    cursor: 'pointer',
    [theme.breakpoints.up('md')]: {
      fontSize: '15px',
    },
    [theme.breakpoints.up('lg')]: {
      fontSize: '27px',
    },
  },
  value: {
    fontWeight: 600,
    fontSize: '18px',
    lineHeight: '24px',
    margin: 0,
    padding: 0,
    whiteSpace: 'nowrap',
    letterSpacing: '0.2px',
    [theme.breakpoints.up('lg')]: {
      fontSize: '18px',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '18px',
      textAlign: 'left',
    },
  },
  platformValue: {
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase',
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
  price: {
    color: '#9595B2',
    letterSpacing: '0.2px',
    fontSize: '14px',
    lineHeight: '18px',
    whiteSpace: 'nowrap',
  },
  platformLabel: {
    fontWeight: 600,
    fontSize: '12px',
    color: theme.palette.type === 'dark' ? '#8585A6' : '#A69885',
  },
  safetyLabel: {
    whiteSpace: 'nowrap',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '24px',
    color: theme.palette.type === 'dark' ? '#8585A6' : '#A69885',
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'left',
    [theme.breakpoints.up('md')]: {
      textAlign: 'center',
    },
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
  centerSpaceOpen: {
    padding: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      padding: '0.5rem 32px 0.5rem 32px',
      justifyContent: 'space-around',
      flexGrow: '0',
      maxWidth: '25%',
      flexBasis: '25%',
    },
    [theme.breakpoints.down('sm')]: {
      flexGrow: '0',
      maxWidth: '100%',
      flexBasis: '100%',
    },
  },
  chart: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  blurred: {
    filter: 'blur(.5rem)',
  },
  depositButton: {
    border: 'solid 2px #54995C',
    backgroundColor: '#54995C',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 700,
    padding: '2px 20px 2px',
    textTransform: 'capitalize',
    display: 'block',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.type === 'dark' ? 'transparent' : '#54995C',
    },
    [theme.breakpoints.up('md')]: {
      marginLeft: 'auto',
      marginRight: '0',
      width: '75%',
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: props => (props.removeMarginButton ? '0px' : '16px'),
      width: '100%',
    },
  },
  apyContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: '0px 0px 20px 20px',
    background: theme.palette.type === 'dark' ? '#313759' : '#faf6f1',
    padding: '20px 0',
    '& .MuiTypography-h1': {
      fontWeight: 600,
      fontSize: '30px',
      lineHeight: '34px',
    },
    '& .MuiTypography-h2': {
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: '24px',
      color: '#8585A6',
    },
    [theme.breakpoints.up('md')]: {
      width: '275px',
      flexDirection: 'column',
      borderRadius: '0px 20px 20px 0px',
    },
  },
  btnSeeDetails: {
    fontSize: '14px',
    lineHeight: '14px',
    fontWeight: 600,
    color: theme.palette.type === 'dark' ? '#6B7199' : '#A69885',
    backgroundColor: theme.palette.type === 'dark' ? '#232743' : 'rgba(0,0,0,0.04)',
    letterSpacing: '0.5px',
    textTransform: 'inherit',
    borderRadius: '20px',
    padding: '5px 15px 5px',
  },
  badgesContainter: {
    display: 'block',
    margin: '0',
    [theme.breakpoints.down('sm')]: {
      margin: '0',
      display: 'flex',
      alignItems: 'center',
    },
  },
  leftCenter: {
    textAlign: 'left',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
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
  networkIconHolder: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  seeDetailsHolder: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  tooltipHolder: {
    marginLeft: theme.spacing(0.5),
  },
  withHasDeposit: {
    '& $apyContainer': {
      background: theme.palette.type === 'dark' ? '#3F466D' : '#faf6f1',
    },
  },
  withMuted: {
    background: '#14182B',
    border: '2px solid #762C2C',
    '&:hover': {
      background: '#14182B',
    },
    '&.hasDeposit': {
      background: 'rgba(48, 53, 92, 0.4)',
      '&:hover': {
        background: 'rgba(48, 53, 92, 0.4)',
      },
    },
  },
  withIsLongName: {
    '& $vaultName': {
      fontSize: '18px',
      [theme.breakpoints.up('md')]: {
        fontSize: '15px',
      },
      [theme.breakpoints.up('lg')]: {
        fontSize: '18px',
      },
    },
  },
  withBoosted: {
    border: '2px solid #DB8332',
  },
  withGovVault: {
    background: '#291E4D',
    border: '2px solid #3C2D71',
  },
  govVaultTitle: {
    fontSize: '15px',
  },
  valueStrikethrough: {
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '18px',
    color: theme.palette.type === 'dark' ? '#8585A6' : '#A69885',
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'left',
    [theme.breakpoints.up('md')]: {
      textAlign: 'center',
    },
    textDecoration: 'line-through',
  },
  statsContainer: {
    margin: props => (props.marginStats ? '16px 0px 0px 0px' : 'auto'),
    [theme.breakpoints.up('md')]: {
      alignItems: 'flex-start',
      flexGrow: '0',
      maxWidth: '70%',
      flexBasis: '70%',
    },
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexGrow: '0',
      maxWidth: '100%',
      flexBasis: '100%',
    },
  },
  platformContainer: {
    display: 'flex',
    marginTop: '8px',
    [theme.breakpoints.down('sm')]: {
      margin: '0 -40px',
    },
  },
  boostSpacer: {
    [theme.breakpoints.up('md')]: {
      height: 18,
    },
    [theme.breakpoints.down('sm')]: {
      height: 20,
    },
  },
  boostSpacerSm: {
    [theme.breakpoints.up('md')]: {
      height: 10,
    },
  },
  mobileSpacer: {
    [theme.breakpoints.down('sm')]: {
      height: 20,
    },
  },
});
