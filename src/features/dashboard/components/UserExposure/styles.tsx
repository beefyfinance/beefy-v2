import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  pieChartsContainer: {
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    columnGap: '24px',
    rowGap: '24px',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2,1fr)',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
});
