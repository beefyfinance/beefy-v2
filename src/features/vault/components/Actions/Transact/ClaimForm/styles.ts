import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }),
  description: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
  }),
};
