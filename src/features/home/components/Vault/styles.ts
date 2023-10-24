import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vault: {
    display: 'block',
    position: 'relative' as const,
    color: '#9595B2',
    background: theme.palette.background.vaults.default,
    borderBottom: 'solid 2px #363B63',
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
    backgroundColor: '#322460',
  },
  vaultRetired: {
    backgroundColor: '#1B1E31',
  },
  vaultInner: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    columnGap: '24px',
    rowGap: '24px',
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: 'minmax(0, 30fr) minmax(0, 70fr)',
    },
  },
});
