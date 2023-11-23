export const styles = () => ({
  positive: {
    color: '#59A662',
  },
  negative: {
    color: theme.palette.background.v2.indicators.error,
  },
  changes: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1em',
    width: '100%',
  },
});
