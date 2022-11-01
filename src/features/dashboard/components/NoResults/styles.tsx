import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.dashboard.cardBg,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: '24px',
    borderRadius: '8px',
  },
  icon: {
    width: '120px',
    height: '120px',
    [theme.breakpoints.up('md')]: {
      width: '132px',
      height: '132px',
    },
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: '4px',
  },
  title: {
    ...theme.typography.h3,
    color: theme.palette.text.primary,
  },
  text: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.secondary,
  },
});
