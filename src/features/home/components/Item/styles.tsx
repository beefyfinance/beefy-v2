export const styles = theme => ({
  itemContainer: {
    [theme.breakpoints.up(1300)]: {
      minWidth: '1230px',
    },
    display: 'flex',
    flexDirection: 'column',
    margin: '0',
    borderRadius: '20px',
    padding: '22px',
    width: '100%',
    height: '100%',
    border: `2px solid ${theme.palette.background.vaults.defaultOutline}`,
    boxShadow: '0px 1px 8px rgba(0,0,0,0.1)',
    background: theme.palette.background.vaults.default,
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
    [theme.breakpoints.only('sm')]: {
      height: '100%',
      margin: '0',
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
  platformLabel: {
    display: 'flex',
    fontWeight: 600,
    fontSize: '12px',
    color: theme.palette.text.disabled,
    '& span': {
      fontWeight: 600,
      fontSize: '12px',
      color: theme.palette.text.primary,
      textTransform: 'uppercase',
      marginLeft: '2px',
    },
  },
  removeLinkStyles: {
    display: 'block', // make sure we have proper height and width
    cursor: 'pointer',
    textDecoration: 'none',
    color: '#FFF',
    width: '100%',
    height: '100%',
  },
  badgesContainter: {
    display: 'block',
    margin: '0',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-start',
    },
    [theme.breakpoints.up('md')]: {
      alignItems: 'center',
      marginTop: '10px',
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: '10px',
      paddingBottom: '10px',
      alignItems: 'flex-start',
      height: '100%',
    },
  },
  marginBottom: {
    [theme.breakpoints.down('sm')]: {
      margin: '0 0 10px 0',
    },
  },
  withMuted: {
    background: `${theme.palette.background.vaults.inactive} !important`,
    border: `2px solid ${theme.palette.background.vaults.inactiveOutline} !important`,
  },
  withIsLongName: {
    '& $vaultName': {
      [theme.breakpoints.up('md')]: {
        fontSize: '15px',
      },
      [theme.breakpoints.up('lg')]: {
        fontSize: '18px',
      },
      [theme.breakpoints.down('sm')]: {
        fontSize: '15px',
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
  fakeGovVaultTitleSpacer: {
    fontSize: '15px',
    [theme.breakpoints.up('md')]: {
      display: 'none',
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
    display: 'flex',
    alignItems: 'center',
  },
});
