export const styles = theme => ({
  portfolio: {
    backgroundColor: theme.palette.background.header,
    padding: '30px 0 30px 0',
  },
  separator: {
    [theme.breakpoints.down('lg')]: {
      marginBottom: theme.spacing(4),
    },
  },
  title: {
    ...theme.typography['h3'],
    color: theme.palette.text.secondary,
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  btnHide: {
    color: '#484F7F',
    marginLeft: '10px',
    padding: 0,
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#6B7199',
    },
  },
  vaults: {
    [theme.breakpoints.up('md')]: {
      textAlign: 'right' as const,
      '& $title': {
        justifyContent: 'flex-end',
      },
    },
  },
});
