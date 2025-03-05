import { css } from '@repo/styles/css';

export const styles = {
  pageContainer: css.raw({
    paddingTop: '120',
    paddingBottom: '120',
    mdDown: {
      paddingTop: '32',
      paddingBottom: '32',
    },
  }),
  inner: css.raw({
    margin: '0 auto',
    width: '1036px',
    maxWidth: '100%',
    display: 'grid',
    columnGap: '132px',
    rowGap: '32px',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'auto',
    md: {
      gridTemplateColumns: 'minmax(0, 1fr) 440px',
    },
  }),
  intro: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingTop: '32px',
  }),
};
