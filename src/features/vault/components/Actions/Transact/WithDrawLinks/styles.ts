import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  btnContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    columnGap: '8px',
    rowGap: '8px',
  },
  btnSecondary: {
    ...theme.typography['body-lg'],
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.v2.button,
    borderRadius: '4px',
    transition: 'color 0.2s',
    padding: '2px 8px',
    width: 'max-content',
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.v2.buttonHover,
      transition: 'color 0.1s',
    },
  },
});
