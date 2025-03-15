import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    sm: {
      padding: '24px',
    },
  }),
  description: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
  }),
};
