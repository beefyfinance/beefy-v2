import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  button: {
    paddingLeft: '10px',
    paddingRight: '10px',
  },
  selected: {
    backgroundColor: theme.palette.primary.main,
  },
});
