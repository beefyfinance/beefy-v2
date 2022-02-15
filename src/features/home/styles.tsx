export const styles = theme => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4rem 0 2rem',
  },
  title: {
    fontSize: 48,
    fontWeight: '600',
    lineHeight: '54px',
    color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
  },
  tvl: {
    fontSize: '2rem',
    fontWeight: '600',
  },
  tvlLabel: {
    display: 'inline',
    color: theme.palette.type === 'dark' ? '#8585A6' : '#ff0000',
  },
  tvlValue: {
    display: 'inline',
    color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
  },
  numberOfVaults: {
    marginTop: 20,
    textTransform: 'uppercase',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '18px',
    letterSpacing: '1px',
  },
  vaultsList: {
    marginTop: '20px',
    marginBottom: '20px',
  },
  row: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  vaultContainer: {
    marginTop: '48px',
  },
  doubleItemContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    [theme.breakpoints.only('sm')]: {
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      gap: spaceBetweenRows => spaceBetweenRows,
    },
  },
  doubleItem1: {
    marginBottom: spaceBetweenRows => spaceBetweenRows,
    [theme.breakpoints.only('sm')]: {
      marginBottom: '0 !important', // idk why mui doesn't make this higher priority
      width: `50%`,
    },
  },
  doubleItem2: {
    [theme.breakpoints.only('sm')]: {
      marginBottom: 0,
      width: '50%',
    },
  },
});
