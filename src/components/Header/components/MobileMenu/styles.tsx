import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  bg: {
    '& .MuiDrawer-paper': {
      backgroundColor: '#0F0F0F',
    },
  },
  toggleDrawer: {
    background: 'transparent',
    padding: '3px',
    border: 0,
    boxShadow: 'none',
    color: theme.palette.text.primary,
    fontSize: '30px',
  },
  toggleDrawerIcon: {
    display: 'block',
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
    backgroundColor: '#1A1C28',
    height: '2px',
  },
  itemTitle: {
    display: 'flex',
    columnGap: '8px',
    color: theme.palette.text.disabled,
    '& .MuiBadge-root': {
      padding: '0px 12px 0px 0px',
      verticalAlign: 'initial',
      columnGap: '8px',
    },
  },
  itemsContainer: {
    padding: '16px 0px 16px 16px',
  },
  customPadding: {
    padding: '16px 16px 16px 32px',
  },
  cross: {
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.text.primary,
      cursor: 'pointer',
    },
  },
});
