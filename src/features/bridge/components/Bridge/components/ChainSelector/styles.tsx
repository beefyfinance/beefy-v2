import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  group: {},
  labels: {
    display: 'flex',
    marginBottom: '4px',
  },
  label: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.dark,
    flex: '1 1 40%',
  },
  buttons: {
    display: 'flex',
    padding: '0 8px',
    background: theme.palette.background.searchInputBg,
    borderRadius: '8px',
  },
  btn: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    padding: '0',
    margin: '0',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer' as const,
    color: theme.palette.text.middle,
    background: theme.palette.background.searchInputBg,
  },
  arrowButton: {
    width: '24px',
    flex: '0 0 24px',
    background: theme.palette.background.searchInputBg,
    '&:hover $arrow': {
      transform: 'rotateY(180deg)',
    },
  },
  arrow: {
    transition: 'transform 0.2s ease-in-out',
    display: 'flex',
    width: '24px',
    '&::after': {
      content: '""',
      display: 'block',
      borderLeft: `12px solid ${theme.palette.background.contentPrimary}`,
      borderTop: '20px solid transparent',
      borderBottom: '20px solid transparent',
    },
  },
  arrowInner: {
    width: '12px',
    background: theme.palette.background.contentPrimary,
    '&::before': {
      content: '""',
      display: 'block',
      borderLeft: `12px solid ${theme.palette.background.searchInputBg}`,
      borderTop: '20px solid transparent',
      borderBottom: '20px solid transparent',
    },
  },
  chain: {
    flex: '1 1 20%',
    padding: '8px 8px',
    '&:hover': {
      color: '#FFF',
    },
  },
  icon: {
    marginRight: '8px',
  },
  from: {
    borderRadius: '8px 0 0 8px',
  },
  to: {
    borderRadius: '0 8px 8px 0',
  },
});
