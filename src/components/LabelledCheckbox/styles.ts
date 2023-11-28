import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  checkbox: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.middle,
    cursor: 'pointer',
    columnGap: '4px',
    userSelect: 'none' as const,
  },
  icon: {
    color: theme.palette.text.dark,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
  },
  checked: {
    '& $icon': {
      color: theme.palette.text.light,
    },
  },
});
