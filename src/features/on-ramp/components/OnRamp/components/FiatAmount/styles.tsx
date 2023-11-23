import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    marginBottom: '8px',
  },
  error: {
    ...theme.typography['body-sm-med'],
    color: theme.palette.background.v2.indicators.error,
    marginTop: '8px',
  },
});
