import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  button: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    cursor: 'pointer' as const,
    '&:hover, &:focus-visible': {
      color: theme.palette.text.primary,
      '& $arrow': {
        color: theme.palette.text.secondary,
      },
    },
  },
  arrow: {
    color: theme.palette.text.disabled,
    height: '24px',
  },
});
