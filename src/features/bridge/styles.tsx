import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  pageContainer: {
    paddingTop: 120,
    paddingBottom: 120,
    [theme.breakpoints.down('md')]: {
      paddingTop: 18,
      paddingBottom: 48,
    },
  },
  inner: {
    margin: '0 auto',
    width: '1036px',
    maxWidth: '100%',
    display: 'grid',
    columnGap: '132px',
    rowGap: '32px',
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto',
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'minmax(0, 1fr) 400px',
    },
  },
});
