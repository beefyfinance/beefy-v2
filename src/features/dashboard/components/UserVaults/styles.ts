import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    '& div:last-child': {
      '& .vault': {
        borderRadius: '0px 0px 8px 8px',
        borderBottom: '0',
      },
    },
  }),
  vaultsContainer: css.raw({
    borderRadius: '12px',
    border: 'solid 2px {colors.background.content.dark}',
  }),
};
