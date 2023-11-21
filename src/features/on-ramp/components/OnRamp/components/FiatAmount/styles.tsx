import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    marginBottom: '8px',
  },
  error: {
    ...theme.typography['body-sm-med'],
    color: '#D15347',
    marginTop: '8px',
  },
});
