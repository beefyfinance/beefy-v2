import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center' as const,
    width: '100%',
    height: '100%',
  },
  circle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(209, 83, 71, 0.15)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: theme.palette.background.v2.indicators.error,
    fontSize: '30px',
  },
  title: {
    ...theme.typography.h3,
    color: theme.palette.text.primary,
    marginTop: '24px',
  },
  content: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.secondary,
    marginTop: '24px',
  },
});
