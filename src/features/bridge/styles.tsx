import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  pageContainer: {
    paddingTop: 120,
    paddingBottom: 120,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 32,
      paddingBottom: 32,
    },
  },
  inner: {
    margin: '0 auto',
    width: '1036px',
    maxWidth: '100%',
    display: 'grid',
    columnGap: '132px',
    rowGap: '32px',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'auto',
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'minmax(0, 1fr) 440px',
    },
  },
  intro: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    paddingTop: '32px',
  },
});
