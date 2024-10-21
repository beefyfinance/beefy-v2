import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  item: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: theme.palette.text.dark,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    userSelect: 'none' as const,
    outline: 'none',
    '&:hover, &:focus-visible': {
      color: theme.palette.text.middle,
      '& $arrow': {
        color: '#fff',
      },
    },
  },
  icon: {
    width: '24px',
    height: '24px',
    marginRight: '8px',
  },
  symbol: {
    marginRight: 'auto',
    display: 'flex',
    gap: '4px',
  },
  balance: {},
  arrow: {
    marginLeft: '12px',
    color: theme.palette.text.middle,
    height: '24px',
  },
  lp: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.middle,
    background: theme.palette.background.buttons.button,
    padding: '2px 8px',
    borderRadius: '4px',
  },
});
