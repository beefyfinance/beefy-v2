import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  title: {
    ...theme.typography.h2,
    color: theme.palette.text.light,
    alignItems: 'center',
  },
  container: {},
  cards: {
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
  },
  content: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.tooltips,
    padding: '12px 16px',
    background: '#fff',
    borderRadius: '8px',
    textAlign: 'left' as const,
  },
});
