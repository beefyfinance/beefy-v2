import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  group: {},
  labels: {
    display: 'flex',
    marginBottom: '4px',
  },
  label: {
    ...theme.typography['subline-sm'],
    fontWeight: 700,
    color: theme.palette.text.disabled,
    flex: '1 1 40%',
  },
  balance: {
    ...theme.typography['body-sm'],
    cursor: 'pointer',
    color: theme.palette.text.disabled,
    '& span': {
      paddingLeft: '4px',
      fontWeight: theme.typography['body-sm-med'].fontWeight,
      color: theme.palette.text.secondary,
    },
  },
  input: {},
});
