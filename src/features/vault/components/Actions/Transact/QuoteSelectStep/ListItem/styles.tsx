import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  item: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: theme.palette.text.disabled,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    userSelect: 'none' as const,
    outline: 'none',
    '&:hover, &:focus-visible': {
      color: theme.palette.text.secondary,
      '& $arrow': {
        color: '#fff',
      },
    },
  },
  provider: {
    marginRight: 'auto',
  },
  output: {},
  arrow: {
    marginLeft: '12px',
    color: theme.palette.text.secondary,
    height: '24px',
  },
});
