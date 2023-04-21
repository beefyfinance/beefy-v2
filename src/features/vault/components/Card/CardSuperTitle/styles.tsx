import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  supertitle: {
    ...theme.typography['subline-lg'],
    color: theme.palette.text.disabled,
  },
});
