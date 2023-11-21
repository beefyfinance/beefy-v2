import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.secondary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
