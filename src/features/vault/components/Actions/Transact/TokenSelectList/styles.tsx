import type { Theme } from '@material-ui/core';

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
  withdraw: {
    height: '360px',
  },
  deposit: {
    height: '436px',
  },
  search: {
    padding: '0 24px',
    margin: '0 0 24px 0',
  },
  searchInput: {
    background: theme.palette.background.searchInputBg,
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
    color: theme.palette.text.dark,
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
    background: theme.palette.background.contentLight,
  },
  buildLp: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.contentLight,
    borderRadius: '0px 0px 8px 8px',
    padding: '16px 24px',
    textDecoration: 'none',
  },
  buildLpContent: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    flex: 1,
    textDecoration: 'none',
  },
  icon: {
    color: theme.palette.text.middle,
  },
});
