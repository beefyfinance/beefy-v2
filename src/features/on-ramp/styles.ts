import { css } from '@repo/styles/css';

export const styles = {
  pageContainer: css.raw({
    paddingTop: '120',
    paddingBottom: '120',
    lgDown: {
      paddingTop: '18',
      paddingBottom: '48',
    },
  }),
  inner: css.raw({
    margin: '0 auto',
    width: '1036px',
    maxWidth: '100%',
    display: 'grid',
    columnGap: '132px',
    rowGap: '32px',
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto',
    md: {
      gridTemplateColumns: 'minmax(0, 1fr) 400px',
    },
  }),
};
