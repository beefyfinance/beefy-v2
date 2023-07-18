import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  tag: {
    padding: '2px 8px',
    background: theme.palette.background.filters.active,
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    borderRadius: '4px',
  },
  icon: {
    width: '16px',
    height: '16px',
    display: 'block',
  },
  tooltip: {},
  link: {
    color: 'inherit',
    textDecoration: 'underline',
  },
});
