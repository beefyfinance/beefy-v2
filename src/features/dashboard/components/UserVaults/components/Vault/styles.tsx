import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vault: {
    display: 'grid',
    position: 'relative' as const,
    color: '#9595B2',
    background: theme.palette.background.contentPrimary,
    padding: '24px 16px',
    textDecoration: 'none',
    borderBottom: `solid 2px ${theme.palette.background.contentDark}`,
    '&:last-child': {
      borderBottom: 0,
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      backgroundClip: 'padding-box',
    },
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
  collapseInner: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    backgroundColor: theme.palette.background.contentDark,
    padding: '16px 24px',
    marginTop: '2px',
    [theme.breakpoints.down('md')]: {
      padding: '16px',
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
  toggleContainer: {
    padding: '16px',
    backgroundColor: theme.palette.background.contentDark,
    display: 'flex',
    justifyContent: 'center',
  },
  buttonText: {
    ...theme.typography['body-sm-med'],
  },
});
