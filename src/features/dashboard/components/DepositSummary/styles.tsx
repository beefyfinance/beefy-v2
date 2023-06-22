import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.alternativeFooterHeader,
    padding: `24px 0 48px 0`,
    [theme.breakpoints.down('sm')]: {
      padding: '24px 0px',
    },
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column' as const,
      rowGap: '12px',
    },
  },
  title: {
    display: 'flex',
    columnGap: '8px',
    alignItems: 'baseline',
    ...theme.typography.h1,
  },
});
