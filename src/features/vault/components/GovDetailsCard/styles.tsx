import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  text: {
    margin: '0 0 32px 0',
    color: theme.palette.text.middle,
    '&:last-child': {
      marginBottom: 0,
    },
  },
  preTitle: {
    ...theme.typography['subline-lg'],
    color: '#8585A6',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
