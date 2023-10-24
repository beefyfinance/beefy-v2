import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  introduction: {},
  title: {
    ...theme.typography['h1'],
    fontSize: '45px',
    lineHeight: '56px',
    color: '#F5F5FF',
    marginTop: 0,
  },
  text: {
    ...theme.typography['body-lg'],
    color: '#D0D0DA',
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
});
