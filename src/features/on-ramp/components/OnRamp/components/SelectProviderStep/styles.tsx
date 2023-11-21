import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  icon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  iconLoading: {
    background: 'rgba(255, 255, 255, 0.12);',
  },
  iconProvider: {
    background: 'red',
  },
  provider: {
    marginRight: '8px',
  },
  rate: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.disabled,
    marginRight: '8px',
  },
  arrow: {
    marginLeft: 'auto',
    color: theme.palette.text.secondary,
    height: '24px',
  },
});
