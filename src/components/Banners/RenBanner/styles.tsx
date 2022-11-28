import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  icon: { height: '24px', width: '24px' },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
    '&:hover': {
      cursor: 'pointer',
    },
  },
});
