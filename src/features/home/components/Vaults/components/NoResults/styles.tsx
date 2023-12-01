import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  message: {
    padding: '24px',
    background: theme.palette.background.contentPrimary,
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
  },
  title: {
    ...theme.typography['h3'],
    color: theme.palette.text.middle,
    margin: '0 0 4px 0',
  },
  text: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.middle,
  },
  extra: {
    marginTop: '24px',
  },
});
