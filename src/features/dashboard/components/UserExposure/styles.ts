import { css } from '@repo/styles/css';

export const styles = {
  pieChartsContainer: css.raw({
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    columnGap: '24px',
    rowGap: '24px',
    lgDown: {
      gridTemplateColumns: 'repeat(2,1fr)',
    },
    mdDown: {
      gridTemplateColumns: '1fr',
    },
  }),
};
