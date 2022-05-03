export const styles = theme => ({
  header: {
    alignItems: 'center',
    backgroundColor: theme.palette.background.vaults.inactive,
    borderRadius: '12px 12px 0 0',
    padding: '24px',
    display: 'flex',
    '& img': {
      marginRight: theme.spacing(2),
    },
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    borderRadius: '0 0 12px 12px',
    padding: '24px',
  },
  title: {
    color: theme.palette.text.primary,
  },
  logo: {
    height: '50px',
  },
  content: {
    color: theme.palette.text.secondary,
  },
  btn: {
    fontSize: '15px',
    lineHeight: '24px',
    fontWeight: 700,
    textTransform: 'none', //'capitalize' no good due to localization
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.primary.main,
    padding: '12px 24px',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#389D44',
    },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  subtitle: {
    color: theme.palette.text.disabled,
    letterSpacing: '0.5px',
    fontWeight: 600,
  },
  subtitle1: {
    color: theme.palette.text.disabled,
    letterSpacing: '0.5px',
    fontWeight: 400,
  },
  info: {
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  info2: {
    marginBottom: theme.spacing(3),
  },
  item: {
    marginRight: theme.spacing(4),
  },
  itemInfo: {
    color: theme.palette.text.secondary,
    fontWeight: 600,
    display: 'flex',
    alingItems: 'center',
  },
  inputContainer: {
    padding: `${theme.spacing(4)}px 0`,
    '& .MuiPaper-root': {
      position: 'relative',
      backgroundColor: theme.palette.background.vaults.inactive,
      borderRadius: '8px',
      padding: 0,
      margin: 0,
      boxShadow: 'none',
      '& .MuiInputBase-input': {
        padding: '10px 5px 8px 40px',
        fontSize: '21px',
        fontWeight: 600,
      },
    },
    '& .MuiTextField-root': {
      backgroundColor: theme.palette.background.vaults.inactive,
      borderRadius: '8px',
      padding: '3px 10px',
    },
    '& .MuiButton-root': {
      fontSize: '12px',
      fontWeight: 400,
      letterSpacing: '0.5px',
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.vaults.defaultOutline,
      borderRadius: '4px',
      margin: 0,
      padding: '5px 12px',
      position: 'absolute',
      top: '6px',
      right: '5px',
      minWidth: 0,
    },
    '& .MuiInputBase-root': {
      width: '100%',
    },
  },
  inputLogo: {
    position: 'absolute',
    top: '12px',
    left: '12px',
  },
  balances: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  label: {
    color: theme.palette.text.disabled,
    fontSize: '12px',
    lineHeight: '18px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  value: {
    color: theme.palette.text.secondary,
    fontSize: '12px',
    lineHeight: '20px',
  },
  customDivider: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      margin: '0 12px',
    },
  },
  line: {
    height: '2px',
    width: '100%',
    backgroundColor: theme.palette.background.vaults.default,
    borderRadius: '8px',
  },
  boxReminder: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(0.5),
    backgroundColor: theme.palette.background.content,
  },
  mb: {
    backgroundColor: '#272B4A',
    borderRadius: '12px',
  },
  tabs: {
    backgroundColor: theme.palette.background.vaults.inactive,
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    '& .MuiButton-root': {
      fontSize: '16px',
      fontWeight: 600,
      letterSpacing: '0.1px',
      textTransform: 'none',
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
  reservesText: {
    color: theme.palette.text.disabled,
    fontWeight: 600,
    letterSpacing: '0.5px',
    marginRight: theme.spacing(0.5),
  },
  amountReserves: {
    marginLeft: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  noReserves: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: '8px',
    backgroundColor: 'rgba(209, 152, 71, 0.15)',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    height: '20px',
    marginRight: theme.spacing(1),
  },
});
