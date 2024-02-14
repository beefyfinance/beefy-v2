export const styles = () => ({
  container: {
    display: 'none',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: 'calc((100vw - 1296px)/2)',
    height: '100%',
    overflow: 'auto',
    whiteSpace: 'pre-wrap' as const,
    backgroundColor: '#111',
    '@media (min-width: 2000px)': {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
  },
  item: {
    '&:nth-child(2n)': {
      background: '#222',
    },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto auto',
    gridTemplateRows: 'auto',
    whiteSpace: 'nowrap' as const,
    width: '100%',
    maxWidth: '100%',
    textAlign: 'left' as const,
    gap: '2px 8px',
  },
  address: {
    textOverflow: 'ellipsis' as const,
    overflow: 'hidden',
  },
});
