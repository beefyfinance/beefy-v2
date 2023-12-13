import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  title: {
    ...theme.typography['h2'],
    color: theme.palette.text.light,
    margin: 0,
  },
  subtitle: {
    ...theme.typography['subline-lg'],
    color: '#8585A6',
  },
});
