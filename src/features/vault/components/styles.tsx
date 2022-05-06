export const styles = theme => ({
  balanceText: {
    fontSize: '12px',
    fontWeight: 600,
    color: theme.palette.text.disabled,
    letterSpacing: '0.5px',
    lineHeight: '20px',
    textTransform: 'uppercase',
  },
  balanceContainer: {
    '& .MuiTypography-body1': {
      fontWeight: '600',
      textTransform: 'inherit',
      color: theme.palette.text.primary,
    },
  },
  inputContainer: {
    paddingTop: '24px',
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
      fontWeight: 600,
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
  btnSubmit: {
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
    '& + $btnSubmit': {
      marginTop: '12px',
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
      borderRadius: '4px',
      textTransform: 'capitalize',
      letterSpacing: '0.1px',
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
    marginBottom: theme.spacing(1.5),
    '& .MuiTypography-root': {
      width: '100%',
    },
    '& .MuiIconButton-label': {
      padding: '0px 12px',
    },
    '& .MuiIconButton-root': {
      padding: 0,
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
    marginBottom: theme.spacing(1.5),
  },
  assetsDivider: {
    display: 'grid',
    columnGap: '16px',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  stakedInValue: {
    display: 'flex',
    alignItems: 'center',
    '& .MuiTypography-body1': {
      fontWeight: 600,
      paddingLeft: '8px',
    },
  },
  width50: {
    width: '50%',
  },
  width100: {
    width: '100%',
  },
  orange: {
    color: theme.palette.background.vaults.boostOutline,
  },
});
