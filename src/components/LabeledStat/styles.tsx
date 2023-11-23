import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  valueStrikethrough: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    textAlign: 'left' as const,
    textDecoration: 'line-through',
  },
  value: {
    ...theme.typography['body-lg-med'],
    margin: 0,
    padding: 0,
  },
});
