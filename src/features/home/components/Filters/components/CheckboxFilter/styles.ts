import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  checkbox: {
    color: theme.palette.text.disabled,
  },
  labelIcon: {
    '& img': {
      display: 'block',
    },
  },
});
