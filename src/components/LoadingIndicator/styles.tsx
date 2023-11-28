import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'inherit',
  },
  icon: {
    marginBottom: '24px',
  },
  text: {
    ...theme.typography['subline-lg'],
    color: theme.palette.text.dark,
  },
});
