import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
});
