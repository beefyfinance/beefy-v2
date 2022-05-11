export const styles = theme => ({
  btnContaniner: {
    marginTop: 16,
  },
  btnSecondary: {
    textDecoration: 'none',
    '& .MuiButton-root': {
      fontSize: '15px',
      lineHeight: '24px',
      fontWeight: 500,
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.background.vaults.defaultOutline,
      borderRadius: '4px',
      textTransform: 'capitalize',
      transition: 'color 0.2s',
      padding: '2px 8px',
      width: 'max-content',
      '&:hover': {
        color: theme.palette.text.primary,
        backgroundColor: '#3F466D',
        transition: 'color 0.1s',
      },
    },
  },
  btnSecondary1: {
    fontSize: '15px',
    lineHeight: '24px',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    borderRadius: '4px',
    textTransform: 'capitalize',
    transition: 'color 0.2s',
    padding: '2px 8px',
    width: 'max-content',
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: '#3F466D',
      transition: 'color 0.1s',
    },
  },
});
