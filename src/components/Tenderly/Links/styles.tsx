import type { Theme } from '@material-ui/core';

export const styles = (_theme: Theme) => ({
  link: {
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  icon: {
    width: 16,
    height: 16,
  },
});
