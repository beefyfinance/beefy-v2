import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  link: {
    ...theme.typography['body-lg'],
    display: 'inline-flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.buttons.button,
    padding: '2px 8px',
    borderRadius: '4px',
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.buttons.buttonHover,
      transition: 'color 0.1s',
    },
  },
  text: {},
  icon: {
    padding: '4px 0',
    height: '24px',
    width: '16px',
  },
});
