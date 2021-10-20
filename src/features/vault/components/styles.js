const styles = theme => ({
  balanceText: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#8585A6',
    letterSpacing: '0.2px',
    lineHeight: '14px',
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
      color: '#ffffff',
    },
    '& .MuiButton-root': {
      fontSize: '16px',
      fontWeight: 600,
      color: '#6B7199',
      backgroundColor: '#232743',
      borderRadius: '20px',
      textTransform: 'capitalize',
      letterSpacing: '0.1px',
      padding: '3px 15px',
      transition: 'color 0.2s',
      '&:hover': {
        color: '#ffffff',
        backgroundColor: '#3F466D',
        transition: 'color 0.1s',
      },
    },
  },
  inputContainer: {
    paddingTop: '10px',
    '& .MuiPaper-root': {
      position: 'relative',
      backgroundColor: '#14182B',
      border: 'solid 2px #3F466D',
      borderRadius: '30px',
      padding: 0,
      margin: 0,
      '& .MuiInputBase-input': {
        padding: '10px 5px 8px 40px',
        fontSize: '21px',
        fontWeight: 600,
      },
    },
    '& .MuiTextField-root': {
      backgroundColor: '#14182B',
      border: 'solid 2px #3F466D',
      borderRadius: '30px',
      padding: '3px 10px',
    },
    '& .MuiButton-root': {
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.5px',
      color: '#ffffff',
      backgroundColor: '#313759',
      borderRadius: '30px',
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
    fontSize: '21px',
    fontWeight: 700,
    letterSpacing: '0.2px',
    textTransform: 'none', //'capitalize' no good due to localization
    color: '#ffffff',
    backgroundColor: '#54995C',
    borderRadius: '40px',
    '&:hover': {
      backgroundColor: '#389D44',
    },
  },
  btnSecondary: {
    textDecoration: 'none',
  },
  depositTokenContainer: {
    width: 'calc(100% + 11px)',
    '& .MuiTypography-root': {
      width: '100%',
    },
  },
});

export default styles;
