const styles = theme => ({
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
});

export default styles;
