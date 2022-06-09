import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  select: {
    paddingLeft: 0,
    paddingRight: 0,
    background: 'transparent',
    marginRight: theme.spacing(3),
    color: theme.palette.text.disabled,
  },
});
