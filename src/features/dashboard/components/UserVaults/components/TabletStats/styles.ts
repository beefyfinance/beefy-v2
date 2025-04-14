import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'none',
    mdOnly: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      columnGap: '32px',
    },
  }),
  boostText: css.raw({
    color: 'text.boosted',
  }),
};
