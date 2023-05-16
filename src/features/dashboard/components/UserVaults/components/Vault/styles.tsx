import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  vault: {
    display: 'grid',
    position: 'relative' as const,
    color: '#9595B2',
    background: theme.palette.background.v2.cardBg,
    padding: '24px 16px',
    textDecoration: 'none',
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
  network: {
    border: 'none',
    top: 0,
    left: 0,
    width: '26px',
    height: '26px',
  },
  collapseInner: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    backgroundColor: theme.palette.background.appBG,
    padding: '16px 24px',
    marginTop: '2px',
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  vaultEarnings: {
    backgroundColor: '#322460',
  },
  vaultPaused: {
    backgroundColor: 'rgba(209, 83, 71, 0.05)',
  },
  vaultRetired: {
    backgroundColor: '#242032',
  },
  toggleContainer: {
    padding: '16px',
    backgroundColor: theme.palette.background.appBG,
    display: 'flex',
    justifyContent: 'center',
  },
  activeClassName: {
    backgroundColor: theme.palette.primary.main,
  },
  buttonText: {
    ...theme.typography['body-sm-med'],
  },
});
