import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    ...theme.typography['subline-sm'],
    color: '#D0D0DA',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
