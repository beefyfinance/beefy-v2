import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  pieChartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    columnGap: '24px',
    rowGap: '24px',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  },
});
