import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  select: {
    paddingLeft: 0,
    paddingRight: 0,
    background: 'transparent',
    color: theme.palette.text.disabled,
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
  },
});
