export const styles = theme => ({
  balanceText: {
    fontSize: '14px',
    fontWeight: 400,
    color: theme.palette.text.disabled,
    letterSpacing: '0.2px',
    lineHeight: '18px',
  },
  balanceContainer: {
    '& .MuiAvatar-root:not(.MuiAvatarGroup-avatar)': {
      height: 16,
      width: 16,
    },
    '& .MuiTypography-body1': {
      fontSize: '14px',
      fontWeight: '600',
      textTransform: 'inherit',
      color: theme.palette.text.primary,
    },
  },
  inputContainer: {
    paddingTop: '10px',
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
      borderRadius: '8px',
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
  btnSubmit: {
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#389D44',
    },
  },
  btnSubmitSecondary: {
    fontSize: '18px',
    marginTop: '12px',
    fontWeight: 700,
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  btnContaniner: {
    marginTop: 16,
  },
  btnSecondary: {
    textDecoration: 'none',
    '& .MuiButton-root': {
      fontSize: '15px',
      lineHeight: '24px',
      fontWeight: 400,
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.background.vaults.defaultOutline,
      borderRadius: '8px',
      textTransform: 'capitalize',
      letterSpacing: '0.1px',
      padding: '3px 15px 4px',
      transition: 'color 0.2s',
      width: 'max-content',
      '&:hover': {
        color: theme.palette.text.primary,
        backgroundColor: '#3F466D',
        transition: 'color 0.1s',
      },
    },
  },
  depositTokenContainer: {
    width: 'calc(100% + 11px)',
    '& .MuiTypography-root': {
      width: '100%',
    },
    '& .MuiButtonBase-root': {
      '& .MuiIconButton-label': {
        color: '#FFF',
      },
    },
  },
  assetCount: {
    color: theme.palette.text.primary,
    fontWeight: 700,
  },
  zapPromotion: {
    color: theme.palette.text.secondary,
    margin: `${theme.spacing(2)}px 0px`,
  },
});
