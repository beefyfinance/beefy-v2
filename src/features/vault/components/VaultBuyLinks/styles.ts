export const styles = theme => ({
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
  btnSecondary1: {
    marginLeft: '12px',
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
});
