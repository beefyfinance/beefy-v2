import type { Theme } from '@material-ui/core';

export const styles = (_theme: Theme) => ({
  tag: {
    padding: '4px',
    background: 'red',
    display: 'flex',
    gap: '4px',
  },
  icon: {
    width: '24px',
    height: '24px',
    display: 'block',
  },
  tooltip: {},
  link: {
    color: 'inherit',
    textDecoration: 'underline',
  },
});
