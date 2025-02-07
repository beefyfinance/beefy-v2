import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  rpcModal: {
    borderRadius: '8px',
    background: theme.palette.background.contentPrimary,
    height: '400px',
    zIndex: 1000,
    // maxWidth: '100%',
    // maxHeight: '100%',
  },
  header: {
    background: theme.palette.background.contentDark,
    borderRadius: '8px 8px 0 0',
    padding: '8px 16px',
  },
  content: {
    height: '90%',
    borderRadius: '0 0 8px 8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    height: '70%',
    padding: '0px 16px',
  },
});
