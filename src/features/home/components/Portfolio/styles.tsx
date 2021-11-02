export const styles = theme => ({
  portfolio: {
    backgroundColor: theme.palette.type === 'dark' ? '#0D0E14' : '#fff',
    padding: '30px 0 30px 0',
  },
  title: {
    fontSize: '36px',
    fontWeight: 600,
    lineHeight: '42px',
    paddingBottom: '16px',
  },
  btnHide: {
    marginTop: '8px',
    textTransform: 'capitalize',
    color: theme.palette.type === 'dark' ? '#484F7F' : '#ff0000',
    fontSize: '16px',
    fontWeight: '600',
    '& .MuiSvgIcon-root': {
      marginRight: '5px',
    },
    '&.MuiButton-text': {
      padding: '6px 0px',
    },
    '&:hover': {
      backgroundColor: 'transparent',
      color: theme.palette.type === 'dark' ? '#6B7199' : '#ff0000',
    },
  },
  vaults: {
    textAlign: 'right',
    [theme.breakpoints.down('md')]: {
      textAlign: 'left',
    },
  },
});
