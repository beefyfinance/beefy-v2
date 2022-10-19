import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  pieChartsContainer: {
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    columnGap: '24px',
    rowGap: '24px',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
});
