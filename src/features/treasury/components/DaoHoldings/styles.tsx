import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    display: 'grid',
    gridGap: '16px',
    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'minmax(0,1fr)',
    },
    paddingBottom: '48px',
  },
});
