import { css } from '@repo/styles/css';

export const styles = {
  statsContainer: css.raw({
    display: 'grid',
    gap: '1px',
    gridTemplateColumns: 'repeat(3, 1fr)',
    smDown: {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  }),
};
