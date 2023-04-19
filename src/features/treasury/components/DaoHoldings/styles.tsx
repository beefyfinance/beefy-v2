export const styles = () => ({
  masonry: {
    display: 'flex',
    paddingBottom: '48px',
    gap: '16px',
    width: '100%',
  },
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    flexBasis: '30%',
    flexGrow: 1,
    gap: '16px',
    '& > :last-child': {
      marginBottom: '0',
    },
  },
});
