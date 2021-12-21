export const styles = theme => ({
  portfolio: {
    backgroundColor: theme.palette.background.header,
    padding: '30px 0 30px 0',
  },
  title: {
    color: theme.palette.text.secondary,
  },
  title2: {
    color: theme.palette.text.secondary,
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      paddingBottom: theme.spacing(1),
    },
  },
  separator: {
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(4),
    },
  },
  titles: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      paddingBottom: theme.spacing(1),
    },
  },
  btnHide: {
    textTransform: 'capitalize',
    color: '#484F7F',
    fontSize: '16px',
    fontWeight: '600',
    '& .MuiSvgIcon-root': {
      marginRight: '5px',
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
