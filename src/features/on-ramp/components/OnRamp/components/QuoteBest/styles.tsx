import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    width: '100%',
  },
  arrow: {
    color: theme.palette.text.disabled,
    height: '24px',
  },
});
