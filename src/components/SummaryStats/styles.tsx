import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  summaryContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    rowGap: '16px',
    columnGap: '16px',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
  container: {
    width: '100%',
    display: 'flex',
    columnGap: '16px',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: theme.palette.background.dashboard.summaryCard,
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: '130px',
    backgroundColor: theme.palette.background.dashboard.iconBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '48px',
    width: '48px',
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
  },
  value: {
    ...theme.typography.h1,
    color: theme.palette.text.secondary,
  },
});
