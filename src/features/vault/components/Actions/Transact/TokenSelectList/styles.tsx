import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    padding: '24px 0 0 0',
    height: '400px', // TODO
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    borderRadius: '0 0 12px 12px',
    overflow: 'hidden',
  },
  search: {
    padding: '0 24px',
    margin: '0 0 24px 0',
  },
  searchInput: {
    background: '#111321',
  },
  chainSelector: {
    padding: '0 24px',
    margin: '0 0 16px 0',
  },
  walletToggle: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    padding: '0 24px',
    margin: '0 0 16px 0',
  },
  inWallet: {
    ...theme.typography['body-lg'],
    color: '#999CB3',
  },
  hideDust: {
    textAlign: 'right' as const,
  },
  listContainer: {
    flexGrow: 1,
    height: '100%',
  },
  list: {
    padding: '0 24px 24px 24px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    overflowY: 'auto' as const,
  },
  noResults: {
    padding: '8px 12px',
    borderRadius: '8px',
    background: '#2D3153',
  },
});
