import { css } from '@repo/styles/css';

export const styles = {
  mobileStat: css.raw({
    textStyle: 'body.sm',
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    color: 'text.dark',
    lgDown: {
      justifyContent: 'space-between',
    },
  }),
  value: css.raw({
    color: 'text.middle',
  }),
};
