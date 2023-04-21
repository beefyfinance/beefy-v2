import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  summaryContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  container: {
    width: '100%',
    display: 'flex',
    columnGap: '16px',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: theme.palette.background.v2.summaryCard,
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
      columnGap: '8px',
      backgroundColor: 'transparent',
      padding: 0,
      alignItems: 'flex-start',
    },
  },
  iconContainer: {
    borderRadius: '130px',
    backgroundColor: theme.palette.background.v2.iconBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '48px',
    width: '48px',
    [theme.breakpoints.down('xs')]: {
      backgroundColor: 'transparent',
      height: '24px',
      width: '24px',
    },
  },
  icon: {},
  contentContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  title: {
    ...theme.typography['subline-lg'],
    fontWeight: 700,
    color: theme.palette.text.disabled,
    [theme.breakpoints.down('xs')]: {
      ...theme.typography['body-sm'],
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
  },
  value: {
    ...theme.typography.h1,
    color: theme.palette.text.secondary,
    [theme.breakpoints.down('xs')]: {
      ...theme.typography['body-lg-med'],
    },
  },
});
