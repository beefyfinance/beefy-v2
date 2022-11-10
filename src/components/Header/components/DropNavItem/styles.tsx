import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    color: theme.palette.text.disabled,
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.text.primary,
    },
  },
  active: {
    color: theme.palette.text.primary,
  },
});
