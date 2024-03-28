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
    color: theme.palette.text.dark,
    flex: '1 1 40%',
  },
  balance: {
    ...theme.typography['body-sm'],
    cursor: 'pointer',
    color: theme.palette.text.dark,
    '& span': {
      paddingLeft: '4px',
      fontWeight: theme.typography['body-sm-med'].fontWeight,
      color: theme.palette.text.middle,
    },
  },
  input: {},
  max: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.light,
    backgroundColor: theme.palette.background.border,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    borderRadius: '4px',
    margin: 0,
    padding: '6px 12px',
    minWidth: 0,
    flexShrink: 0,
    cursor: 'pointer',
    marginRight: '12px',
    '&:disabled': {
      color: theme.palette.text.dark,
      backgroundColor: theme.palette.background.buttons.button,
      borderColor: theme.palette.background.contentLight,
      opacity: 0.4,
    },
  },
});
