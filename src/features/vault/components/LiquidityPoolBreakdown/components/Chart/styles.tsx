import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.middle,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
