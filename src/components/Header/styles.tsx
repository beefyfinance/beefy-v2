import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  headerContainer: {
    flexGrow: 1,
  },
  navHeader: {
    background: 'transparent',
    boxShadow: 'none',
    '&:hover .MuiListItem-button': {
      background: 'transparent',
    },
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    columnGap: '12px',
  },
  hasPortfolio: {
    backgroundColor: theme.palette.background.footerHeader,
  },
  container: {
    paddingTop: '12px',
    paddingBottom: '12px',
  },
  content: {
    justifyContent: 'space-between',
  },
  beefy: {
    display: 'block',
    '& img': {
      height: '40px',
      display: 'block',
    },
  },
});
