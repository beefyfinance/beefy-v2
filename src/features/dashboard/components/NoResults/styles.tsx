import type { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.contentPrimary,
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
    color: theme.palette.text.light,
    textAlign: 'center' as const,
  },
  text: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.middle,
    textAlign: 'center' as const,
  },
  actionsContainer: {
    display: 'grid',
    gap: '12px',
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    width: '272px',
  },
  line: {
    height: '2px',
    width: '100%',
    backgroundColor: theme.palette.background.contentLight,
    borderRadius: '8px',
  },
  btn: {
    width: '100%',
    padding: '6px 12px',
    maxWidth: '272px',
  },
  or: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
  },
  search: {
    backgroundColor: theme.palette.background.searchInputBg,
  },
});
