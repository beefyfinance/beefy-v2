import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  introduction: {},
  title: {
    ...theme.typography['h1'],
    fontSize: '45px',
    lineHeight: '56px',
    color: theme.palette.text.primary,
    marginTop: 0,
  },
  text: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.secondary,
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
});
