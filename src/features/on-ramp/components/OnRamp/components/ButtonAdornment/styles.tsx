import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  button: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
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
      color: theme.palette.text.light,
      '& $arrow': {
        color: theme.palette.text.middle,
      },
    },
  },
  arrow: {
    color: theme.palette.text.dark,
    height: '24px',
  },
});
