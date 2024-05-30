import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vaultRow: {
    borderBottom: `solid 2px ${theme.palette.background.contentDark}`,
    '&:last-child': {
      borderBottom: 0,
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      backgroundClip: 'padding-box',
      overflow: 'hidden',
    },
  },
  vault: {
    display: 'grid',
    position: 'relative' as const,
    color: '#9595B2',
    background: theme.palette.background.contentPrimary,
    padding: '24px 16px',
    textDecoration: 'none',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  vaultInner: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 30fr) minmax(0, 70fr)',
    columnGap: '8px',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'minmax(0, 80fr) minmax(0, 20fr)',
    },
  },
  vaultEarnings: {
    backgroundColor: theme.palette.background.vaults.gov,
  },
  vaultPaused: {
    backgroundColor: 'rgba(209, 83, 71, 0.05)',
  },
  vaultRetired: {
    backgroundColor: theme.palette.background.vaults.inactive,
  },
  vaultClm: {
    backgroundColor: theme.palette.background.vaults.clm,
  },
});
