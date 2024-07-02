import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
    cursor: 'pointer',
  },
});
