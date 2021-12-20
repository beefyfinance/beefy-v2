export const styles = theme => ({
  portfolio: {
    backgroundColor: theme.palette.background.header,
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
    color: '#484F7F',
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
      color: '#6B7199',
    },
  },
  vaults: {
    textAlign: 'right',
    [theme.breakpoints.down('md')]: {
      textAlign: 'left',
    },
  },
});
