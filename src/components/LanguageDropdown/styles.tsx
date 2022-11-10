import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  select: {
    paddingLeft: 0,
    paddingRight: 0,
    background: 'transparent',
    color: theme.palette.text.disabled,
  },
});
