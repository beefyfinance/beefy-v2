export const styles = theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    background: theme.palette.background.vaults.inactive,
    borderRadius: '10px 10px 0px 0px ',
    borderBottom: '2px solid #2D3153',
  },
  title: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  powerBy: {
    color: theme.palette.text.secondary,
  },
  content: {
    padding: '24px',
    borderRadius: '4px',
  },
  btn: {
    height: '48px',
    width: '100%',
    padding: '12px 24px',
    textTransform: 'none',
    borderRadius: '8px',
    backgroundColor: theme.palette.primary.main,
    '& .MuiButton-label': {
      fontWeight: 700,
      color: '#FFF',
    },
  },
  customDivider: {
    display: 'flex',
    alignItems: 'center',
    margin: `${theme.spacing(4)}px 0px`,
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
  fees: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.content,
    borderRadius: '8px',
    margin: `${theme.spacing(3)}px 0px`,
  },
  feesContent: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  feesItem: {
    width: '50%',
  },
  advice: {
    color: theme.palette.text.disabled,
    margin: `${theme.spacing(1)}px 0px`,
  },
  advice1: {
    color: theme.palette.text.disabled,
  },
  label: {
    color: theme.palette.text.disabled,
    letterSpacing: '0.5px',
    fontWeight: 600,
  },
  value: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  balance: {
    color: theme.palette.text.disabled,
    '& span': {
      fontWeight: 600,
      color: theme.palette.text.secondary,
    },
  },
  address: {
    color: theme.palette.text.disabled,
    '& span': {
      color: theme.palette.text.secondary,
    },
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  inputContainer: {
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
  networkPicker: {
    width: '50%',
    marginRight: theme.spacing(1),
  },
  networkValue: {
    display: 'flex',
    color: `${theme.palette.text.secondary} !important`,
    fontWeight: 700,
  },
  networkContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  chainName: {
    fontWeight: 700,
    color: theme.palette.text.secondary,
  },
  bridgedValue: {
    fontWeight: 700,
    color: theme.palette.text.disabled,
  },
  icon: {
    height: '20px',
    marginRight: '4px',
  },
});
