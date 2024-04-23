import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {},
  chainSelectorBtn: {
    ...theme.typography['body-lg'],
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: '0 0 0 auto',
    background: 'none',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer',
    color: theme.palette.text.middle,
    '&:hover': {
      color: theme.palette.text.light,
    },
  },
  chainSelectorIcon: {},
});
