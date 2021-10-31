const styles = theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0,0,0,0.9)',
    },
    '& .MuiTypography-h2': {
      fontSize: '30px',
      fontWeight: 600,
      lineHeight: '42px',
      textAlign: 'center',
    },
    '& .MuiTypography-body2': {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
      letterSpacing: '0.2px',
      paddingTop: '20px',
      textAlign: 'center',
    },
    '& .MuiAlert-root': {
      marginTop: '20px',
    },
  },
  finishedCard: {
    backgroundColor: '#323857',
    borderRadius: '20px',
    '& .MuiTypography-h2': {
      fontSize: '36px',
      lineHeight: '42px',
      fontWeight: 600,
    },
    '& .MuiTypography-body1': {
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0.2px',
      textAlign: 'center',
      padding: '20px 0',
    },
  },
  finishedBtn: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#6B7199',
    backgroundColor: '#232841',
    borderRadius: '20px',
    textTransform: 'inherit',
    padding: '4px 15px',
    transition: 'color 0.2s',
    '&:hover': {
      color: '#ffffff',
      transition: 'color 0.2s',
    },
  },
});

export default styles;
