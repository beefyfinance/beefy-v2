import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    borderRadius: '12px',
    backgroundColor: theme.palette.background.contentPrimary,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '16px',
    backgroundColor: theme.palette.background.contentDark,
    borderRadius: '12px 12px 0px 0px ',
    padding: '24px',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
  icon: {
    height: '48px',
  },
  subTitle: {
    ...theme.typography['subline-lg'],
    fontWeight: 700,
    color: theme.palette.text.dark,
  },
  title: {
    ...theme.typography.h3,
    fontWeight: 500,
    color: theme.palette.text.light,
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    padding: '24px',
    rowGap: '16px',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },
});
