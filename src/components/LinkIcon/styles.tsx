import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  link: {
    display: 'inline-flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textDecoration: 'none',
    color: theme.palette.text.middle,
    backgroundColor: theme.palette.background.buttons.button,
    padding: '2px 8px',
    borderRadius: '4px',
    height: '32px',
    '&:hover': {
      color: theme.palette.text.light,
      backgroundColor: '#3F466D',
      transition: 'color 0.1s',
    },
  },
  icon: {},
  svgIcon: {
    width: '16px',
    height: '16px',
  },
});
