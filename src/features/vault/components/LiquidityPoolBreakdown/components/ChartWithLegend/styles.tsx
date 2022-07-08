import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    padding: '24px',
    display: 'flex',
    columnGap: '24px',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      columnGap: '48px',
    },
    [theme.breakpoints.up('lg')]: {
      flexDirection: 'column' as const,
      borderRight: 'solid 2px #363B63',
    },
  },
  legend: {
    [theme.breakpoints.up('lg')]: {
      marginTop: '24px',
    },
  },
});
