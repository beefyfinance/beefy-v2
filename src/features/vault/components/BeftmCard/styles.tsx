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
    color: theme.palette.text.primary,
    fontSize: '15px',
    lineHeight: '24px',
    fontWeight: 700,
    padding: '12px 24px',
    backgroundColor: theme.palette.primary.main,
    textTransform: 'none',
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
    '& .MuiAvatar-root:not(.MuiAvatarGroup-avatar)': {
      height: 20,
      width: 20,
    },
  },
  balances: {
    display: 'flex',
    justifyContent: 'space-between',
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
    '& svg': {
      margin: '0 12px',
    },
  },
  line: {
    height: '2px',
    width: '100%',
    backgroundColor: theme.palette.text.disabled,
    borderRadius: '8px',
  },
});
