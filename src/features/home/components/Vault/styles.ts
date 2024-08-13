import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vault: {
    display: 'block',
    position: 'relative' as const,
    color: theme.palette.text.dark,
    background: theme.palette.background.vaults.default,
    borderBottom: `solid 2px ${theme.palette.background.contentDark}`,
    padding: '24px',
    textDecoration: 'none',
    '&:last-child': {
      borderBottom: 0,
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      backgroundClip: 'padding-box',
    },
  },
  vaultEarnings: {
    backgroundColor: theme.palette.background.vaults.gov,
  },
  vaultCowcentrated: {
    backgroundColor: theme.palette.background.vaults.clm,
  },
  vaultCowcentratedPool: {
    backgroundColor: theme.palette.background.vaults.clmPool,
  },
  vaultCowcentratedVault: {
    backgroundColor: theme.palette.background.vaults.clmVault,
  },
  vaultRetired: {
    backgroundColor: theme.palette.background.vaults.inactive,
  },
  vaultInner: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    columnGap: '24px',
    rowGap: '24px',
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: 'minmax(0, 40fr) minmax(0, 60fr)',
    },
  },
});
