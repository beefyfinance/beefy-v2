import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  }),
  icon: css.raw({
    width: '24px',
    height: '24px',
  }),
};
