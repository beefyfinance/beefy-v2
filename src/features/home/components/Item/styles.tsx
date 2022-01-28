export const styles = theme => ({
  itemContainer: {
    [theme.breakpoints.up(1300)]: {
      minWidth: '1230px',
    },
    display: 'flex',
    flexDirection: 'column',
    margin: '20px 0 0 0',
    borderRadius: '20px',
    padding: '22px',
    width: '100%',
    border: `2px solid ${theme.palette.background.vaults.defaultOutline}`,
    boxShadow: '0px 1px 8px rgba(0,0,0,0.1)',
    background: theme.palette.background.vaults.default,
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
    [theme.breakpoints.only('sm')]: {
      marginRight: '10px',
      marginLeft: '10px',
      width: 'calc(100% - 20px)',
      height: 380,
    },
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& img': {
      height: '24px',
    },
    width: 'fit-content',
  },
  titleContainer: {
    display: 'flex',
    padding: '0 0 8px 0',
    flexDirection: 'row',
    alignItems: 'space-around',
    justifyContent: 'center',
    [theme.breakpoints.up('md')]: {
      alignItems: 'flex-start',
      maxWidth: '30%',
      flexBasis: '30%',
    },
    [theme.breakpoints.down('sm')]: {
      padding: 0,
      alignItems: 'flex-start',
      maxWidth: '100%',
      marginBottom: theme.spacing(3),
    },
  },
  imageContainer: {
    paddingRight: '16px',
  },
  infoContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '& .MuiAvatar-root:not(.MuiAvatarGroup-avatar)': {
      cursor: 'pointer',
      marginRight: '8px',
      height: 60,
      width: 60,
      [theme.breakpoints.down('sm')]: {
        height: 32,
        width: 32,
        marginRight: '8px',
      },
    },
  },
  flexCenter: {
    display: 'flex',
    alingItems: 'center',
  },
  vaultName: {
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
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
  price: {
    color: theme.palette.text.disabled,
    fontWeight: 400,
    letterSpacing: '0.2px',
    fontSize: '14px',
    lineHeight: '18px',
    whiteSpace: 'nowrap',
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
  safetyLabel: {
    whiteSpace: 'nowrap',
    fontWeight: 600,
    fontSize: '12px',
    lineHeight: '24px',
    color: theme.palette.text.disabled,
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    textAlign: 'left',
    [theme.breakpoints.up('md')]: {
      textAlign: 'center',
    },
  },
  centerSpace: {
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
      margin: '10px 0',
      flexGrow: '0',
      maxWidth: '50%',
      flexBasis: '50%',
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
    border: `solid 2px ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 700,
    padding: '2px 20px 2px',
    textTransform: 'capitalize',
    display: 'block',
    minWidth: '64px',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: 'transparent',
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
  removeLinkStyles: {
    textDecoration: 'none',
    color: '#FFF',
    width: '100%',
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
    alignItems: 'flex-start',
    [theme.breakpoints.up('md')]: {
      alignItems: 'center',
    },
    [theme.breakpoints.down('md')]: {
      margin: '10px 0',
      alignItems: 'flex-start',
    },
  },
  stat1: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    [theme.breakpoints.up('md')]: {
      alignItems: 'center',
    },
    [theme.breakpoints.down('md')]: {
      marginTop: '10px',
      alignItems: 'flex-start',
    },
  },
  marginBottom: {
    [theme.breakpoints.down('md')]: {
      margin: '0 0 10px 0',
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
  withMuted: {
    background: theme.palette.background.vaults.inactive,
    border: `2px solid ${theme.palette.background.vaults.inactiveOutline}`,
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
      [theme.breakpoints.up('md')]: {
        fontSize: '15px',
      },
      [theme.breakpoints.up('lg')]: {
        fontSize: '18px',
      },
    },
  },
  withBoosted: {
    border: `2px solid ${theme.palette.background.vaults.boostOutline}`,
  },
  withGovVault: {
    background: theme.palette.background.vaults.gov,
    border: `2px solid ${theme.palette.background.vaults.govOutline}`,
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
    margin: 'auto',
    [theme.breakpoints.up('md')]: {
      alignItems: 'flex-start',
      maxWidth: '70%',
      flexBasis: '70%',
    },
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      maxWidth: '100%',
    },
  },
  platformContainer: {
    display: 'flex',
    marginTop: theme.spacing(1),
  },
  spacingMobile: {
    display: 'flex',
    alingItems: 'center',
    [theme.breakpoints.down('sm')]: {
      padding: '5px 0',
    },
  },
  contentContainer: {
    margin: 'auto',
    [theme.breakpoints.down('md')]: {
      margin: 0,
      marginTop: theme.spacing(3),
    },
  },
});
