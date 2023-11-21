import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  tokenAdornment: {
    background: 'transparent',
    padding: 0,
    margin: 0,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer' as const,
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.primary,
  },
  icon: {
    marginRight: '8px',
  },
});
