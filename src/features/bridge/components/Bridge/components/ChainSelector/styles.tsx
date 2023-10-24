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
    color: theme.palette.text.disabled,
    flex: '1 1 40%',
  },
  buttons: {
    display: 'flex',
    padding: '0 8px',
    background: '#111321',
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
    color: '#D0D0DA',
    background: '#111321',
  },
  arrowButton: {
    width: '24px',
    flex: '0 0 24px',
    background: '#111321',
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
      borderLeft: '12px solid #232743',
      borderTop: '20px solid transparent',
      borderBottom: '20px solid transparent',
    },
  },
  arrowInner: {
    width: '12px',
    background: '#232743',
    '&::before': {
      content: '""',
      display: 'block',
      borderLeft: '12px solid #111321',
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
