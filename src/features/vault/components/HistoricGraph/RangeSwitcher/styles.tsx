import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  tabs: {
    border: 0,
    padding: 0,
    background: 'transparent',
    gap: '12px',
  },
  tab: {
    ...theme.typography['body-sm-med'],
    border: 0,
    padding: 0,
    background: 'transparent',
    '&:hover': {
      background: 'transparent',
    },
  },
  selected: {
    background: 'transparent',
  },
});
