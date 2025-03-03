import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  bg: {
    '& .MuiDrawer-paper': {
      backgroundColor: theme.palette.background.footerHeader,
    },
  },
  toggleDrawer: {
    background: 'transparent',
    padding: '0',
    border: 0,
    boxShadow: 'none',
    color: theme.palette.text.light,
    fontSize: '30px',
    position: 'relative' as const,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleDrawerIcon: {
    display: 'block',
  },
  toggleDrawNotification: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
  },
  menuContainer: {
    height: '100%',
    [theme.breakpoints.down('lg')]: {
      width: '320px',
    },
  },
  head: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex: {
    display: 'flex',
    columnGap: '24px',
  },
  divider: {
    backgroundColor: theme.palette.background.contentDark,
    height: '2px',
  },
  itemTitle: {
    display: 'flex',
    columnGap: '8px',
    color: theme.palette.text.dark,
    '& .MuiBadge-root': {
      padding: '0px 12px 0px 0px',
      verticalAlign: 'initial',
      columnGap: '8px',
    },
  },
  title: {},
  titleWithBadge: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  itemsContainer: {
    padding: '16px 0px 16px 16px',
  },
  customPadding: {
    padding: '16px 16px 16px 32px',
  },
  cross: {
    color: theme.palette.text.middle,
    '&:hover': {
      color: theme.palette.text.light,
      cursor: 'pointer',
    },
  },
});
