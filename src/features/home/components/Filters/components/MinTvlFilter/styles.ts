import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  checkbox: {
    color: theme.palette.text.dark,
  },
  largeTvlCheckbox: {
    color: theme.palette.text.dark,
    fontSize: theme.typography['body-sm'].fontSize,
  },
  labelIcon: {
    '& img': {
      display: 'block',
    },
  },
  amountContainer: {
    marginLeft: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '8px',
  },
});
