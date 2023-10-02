import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  checkbox: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    color: '#D0D0DA',
    cursor: 'pointer',
    columnGap: '4px',
    userSelect: 'none' as const,
  },
  icon: {
    color: '#848BAD',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
  },
  checked: {
    '& $icon': {
      color: '#F5F5FF',
    },
  },
});
