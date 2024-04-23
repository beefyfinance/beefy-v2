import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  content: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.primary,
    padding: '12px 16px',
    minWidth: '250px',
    background: '#1B1D32',
    borderRadius: '8px',
    textAlign: 'left' as const,
  },
  timestamp: {
    marginBottom: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px 16px',
  },
  label: {
    color: theme.palette.text.dark,
  },
  labelDetail: {
    ...theme.typography['body-sm'],
    lineHeight: 1,
  },
  value: {
    ...theme.typography['body-lg-med'],
    textAlign: 'right' as const,
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
});
