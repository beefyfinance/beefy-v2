import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.primary,
    background: theme.palette.background.indicators.warning,
    padding: '16px',
    borderRadius: '8px',
  },
  link: {
    color: theme.palette.text.primary,
    textDecoration: 'underline',
    '&:hover': {
      cursor: 'pointer' as const,
    },
  },
});
