export const styles = theme => ({
  portfolio: {
    backgroundColor: theme.palette.background.header,
    padding: `${40 - 24}px 0 40px 0`,
    [theme.breakpoints.down('sm')]: {
      padding: '12px 0 32px 0',
    },
  },
  container: {
    [theme.breakpoints.down('sm')]: {
      padding: '0 12px',
    },
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '100%',
    gap: '32px',
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: '583fr 417fr',
    },
    [theme.breakpoints.down('sm')]: {
      rowGap: '24px',
    },
  },
  userStats: {},
  vaultStats: {
    [theme.breakpoints.up('md')]: {
      textAlign: 'right' as const,
      '& $title': {
        justifyContent: 'flex-end',
      },
    },
  },
  title: {
    ...theme.typography['h3'],
    color: theme.palette.text.middle,
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  btnHide: {
    color: '#484F7F',
    marginLeft: '8px',
    padding: 0,
    minWidth: 0,
    width: 'auto',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#6B7199',
    },
  },
});
