import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    padding: 24,
    borderRadius: '12px',
    backgroundColor: theme.palette.background.v2.cardHeader,
  },
  content: {
    padding: 16,
  },
  title: {
    display: 'flex',
    padding: 0,
    justifyContent: 'space-between',
    backgroundColor: 'transparent' as const,
    borderColor: 'transparent' as const,
    '&:Hover': {
      backgroundColor: 'transparent' as const,
      borderColor: 'transparent' as const,
    },
  },
  titleIcon: {
    fill: theme.palette.text.disabled,
  },
});
