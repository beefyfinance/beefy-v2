import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  collapseInner: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    backgroundColor: theme.palette.background.contentDark,
    padding: '16px 24px',
    marginTop: '2px',
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
  toggleContainer: {
    padding: '16px',
    backgroundColor: theme.palette.background.contentDark,
    display: 'flex',
    justifyContent: 'center',
  },
});
